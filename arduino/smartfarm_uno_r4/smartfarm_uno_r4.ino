/*
 * 스마트팜 시스템 - Arduino UNO R4 WiFi
 * 
 * 센서:
 * - DHT11 (온도/습도): 2번 핀
 * - TDS Meter (EC): A0 핀 (현재 연결 안 됨, 랜덤 데이터 생성)
 * - pH 센서: A1 핀 (현재 연결 안 됨, 랜덤 데이터 생성)
 * 
 * 액추에이터:
 * - LED: 3번 핀
 * - Pump: 4번 핀
 * - Fan1: 5번 핀
 * - Fan2: 6번 핀
 * 
 * MQTT 토픽:
 * - 발행: smartfarm/sensors/temperature, humidity, ec, ph, all
 * - 구독: smartfarm/actuators/led, pump, fan1, fan2, all
 */

#include <WiFiS3.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <ArduinoJson.h>

// WiFi 설정 (사용자의 WiFi 정보로 변경 필요)
const char* ssid = "smartfarmds";
const char* password = "smartfarmds";

// MQTT 브로커 설정 (HiveMQ Cloud 정보로 변경 필요)
const char* mqtt_server = "b0ac673e3e77419584a63901db184810.s1.eu.hivemq.cloud";
const int mqtt_port = 8883;  // TLS 포트
const char* mqtt_username = "Kevin";
const char* mqtt_password = "@316Wjsrudeo";
const char* mqtt_client_id = "arduino-uno-r4-smartfarm-cks7349";

// 센서 핀 정의
#define DHT_PIN 2
#define DHT_TYPE DHT11
#define EC_PIN A0
#define PH_PIN A1

// 액추에이터 핀 정의
#define LED_PIN 3
#define PUMP_PIN 4
#define FAN1_PIN 5
#define FAN2_PIN 6

// 센서 및 네트워크 객체
DHT dht(DHT_PIN, DHT_TYPE);
WiFiSSLClient wifiClient;
PubSubClient mqttClient(wifiClient);

// 전역 변수
unsigned long lastSensorRead = 0;
const unsigned long sensorInterval = 5000;  // 센서 읽기 간격 (5초)

// 액추에이터 상태
bool ledState = false;
int ledBrightness = 0;
bool pumpState = false;
bool fan1State = false;
bool fan2State = false;

// 랜덤 시드용
unsigned long lastRandomSeed = 0;

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("=== 스마트팜 시스템 시작 ===");

  // 액추에이터 핀 초기화
  pinMode(LED_PIN, OUTPUT);
  pinMode(PUMP_PIN, OUTPUT);
  pinMode(FAN1_PIN, OUTPUT);
  pinMode(FAN2_PIN, OUTPUT);
  
  // 모든 액추에이터 초기 상태: OFF
  digitalWrite(LED_PIN, LOW);
  digitalWrite(PUMP_PIN, LOW);
  digitalWrite(FAN1_PIN, LOW);
  digitalWrite(FAN2_PIN, LOW);

  // DHT11 센서 초기화
  dht.begin();
  Serial.println("DHT11 센서 초기화 완료");

  // WiFi 연결
  setupWiFi();

  // MQTT 클라이언트 설정
  // HiveMQ Cloud는 TLS 인증서 검증 필요
  // Arduino R4 WiFi의 WiFiSSLClient 사용 (기본적으로 TLS 지원)
  mqttClient.setServer(mqtt_server, mqtt_port);
  mqttClient.setCallback(mqttCallback);

  // MQTT 연결
  connectMQTT();

  // 랜덤 시드 초기화
  randomSeed(analogRead(A2));  // A2 핀의 노이즈로 시드 생성

  Serial.println("=== 시스템 준비 완료 ===");
}

void loop() {
  // MQTT 연결 유지
  if (!mqttClient.connected()) {
    connectMQTT();
  }
  mqttClient.loop();

  // 정기적으로 센서 데이터 읽기 및 발행
  unsigned long currentMillis = millis();
  if (currentMillis - lastSensorRead >= sensorInterval) {
    lastSensorRead = currentMillis;
    readAndPublishSensors();
  }
}

/*
 * WiFi 연결 설정
 */
void setupWiFi() {
  Serial.print("WiFi 연결 중: ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.println("WiFi 연결 성공!");
    Serial.print("IP 주소: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println();
    Serial.println("WiFi 연결 실패!");
  }
}

/*
 * MQTT 연결
 */
void connectMQTT() {
  while (!mqttClient.connected()) {
    Serial.print("MQTT 연결 시도 중...");

    if (mqttClient.connect(mqtt_client_id, mqtt_username, mqtt_password)) {
      Serial.println("연결 성공!");

      // 액추에이터 제어 토픽 구독
      mqttClient.subscribe("smartfarm/actuators/led");
      mqttClient.subscribe("smartfarm/actuators/pump");
      mqttClient.subscribe("smartfarm/actuators/fan1");
      mqttClient.subscribe("smartfarm/actuators/fan2");
      mqttClient.subscribe("smartfarm/actuators/all");

      Serial.println("MQTT 토픽 구독 완료");
    } else {
      Serial.print("연결 실패, rc=");
      Serial.print(mqttClient.state());
      Serial.println(" 5초 후 재시도...");
      delay(5000);
    }
  }
}

/*
 * MQTT 메시지 콜백 (액추에이터 제어 명령 수신)
 */
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  Serial.print("메시지 수신 [");
  Serial.print(topic);
  Serial.print("]: ");

  // JSON 파싱을 위한 버퍼
  char message[length + 1];
  memcpy(message, payload, length);
  message[length] = '\0';

  Serial.println(message);

  // JSON 파싱
  StaticJsonDocument<200> doc;
  DeserializationError error = deserializeJson(doc, message);

  if (error) {
    Serial.print("JSON 파싱 오류: ");
    Serial.println(error.c_str());
    return;
  }

  // 토픽에 따라 처리
  String topicStr = String(topic);

  if (topicStr == "smartfarm/actuators/led") {
    handleLEDControl(doc);
  } else if (topicStr == "smartfarm/actuators/pump") {
    handlePumpControl(doc);
  } else if (topicStr == "smartfarm/actuators/fan1") {
    handleFan1Control(doc);
  } else if (topicStr == "smartfarm/actuators/fan2") {
    handleFan2Control(doc);
  } else if (topicStr == "smartfarm/actuators/all") {
    handleAllActuatorsControl(doc);
  }
}

/*
 * LED 제어 처리
 */
void handleLEDControl(JsonDocument& doc) {
  if (doc.containsKey("state")) {
    ledState = doc["state"];
    digitalWrite(LED_PIN, ledState ? HIGH : LOW);
    Serial.print("LED: ");
    Serial.println(ledState ? "ON" : "OFF");
  } else if (doc.containsKey("brightness")) {
    ledBrightness = doc["brightness"];
    ledState = (ledBrightness > 0);
    analogWrite(LED_PIN, ledBrightness);
    Serial.print("LED 밝기: ");
    Serial.println(ledBrightness);
  }
}

/*
 * Pump 제어 처리
 */
void handlePumpControl(JsonDocument& doc) {
  if (doc.containsKey("state")) {
    pumpState = doc["state"];
    digitalWrite(PUMP_PIN, pumpState ? HIGH : LOW);
    Serial.print("Pump: ");
    Serial.println(pumpState ? "ON" : "OFF");
  }
}

/*
 * Fan1 제어 처리
 */
void handleFan1Control(JsonDocument& doc) {
  if (doc.containsKey("state")) {
    fan1State = doc["state"];
    digitalWrite(FAN1_PIN, fan1State ? HIGH : LOW);
    Serial.print("Fan1: ");
    Serial.println(fan1State ? "ON" : "OFF");
  }
}

/*
 * Fan2 제어 처리
 */
void handleFan2Control(JsonDocument& doc) {
  if (doc.containsKey("state")) {
    fan2State = doc["state"];
    digitalWrite(FAN2_PIN, fan2State ? HIGH : LOW);
    Serial.print("Fan2: ");
    Serial.println(fan2State ? "ON" : "OFF");
  }
}

/*
 * 모든 액추에이터 제어 처리
 */
void handleAllActuatorsControl(JsonDocument& doc) {
  if (doc.containsKey("led")) {
    JsonObject ledObj = doc["led"];
    if (ledObj.containsKey("enabled")) {
      ledState = ledObj["enabled"];
      digitalWrite(LED_PIN, ledState ? HIGH : LOW);
    }
    if (ledObj.containsKey("brightness")) {
      ledBrightness = ledObj["brightness"];
      analogWrite(LED_PIN, ledBrightness);
    }
  }
  
  if (doc.containsKey("pump")) {
    JsonObject pumpObj = doc["pump"];
    if (pumpObj.containsKey("enabled")) {
      pumpState = pumpObj["enabled"];
      digitalWrite(PUMP_PIN, pumpState ? HIGH : LOW);
    }
  }
  
  if (doc.containsKey("fan1")) {
    JsonObject fan1Obj = doc["fan1"];
    if (fan1Obj.containsKey("enabled")) {
      fan1State = fan1Obj["enabled"];
      digitalWrite(FAN1_PIN, fan1State ? HIGH : LOW);
    }
  }
  
  if (doc.containsKey("fan2")) {
    JsonObject fan2Obj = doc["fan2"];
    if (fan2Obj.containsKey("enabled")) {
      fan2State = fan2Obj["enabled"];
      digitalWrite(FAN2_PIN, fan2State ? HIGH : LOW);
    }
  }

  Serial.println("모든 액추에이터 제어 업데이트 완료");
}

/*
 * 센서 데이터 읽기 및 MQTT 발행
 */
void readAndPublishSensors() {
  // DHT11 온도/습도 읽기
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  // EC 센서 읽기 (현재 연결 안 됨, 랜덤 데이터 생성)
  // 실제 센서 연결 시 아래 주석 해제
  /*
  int ecRaw = analogRead(EC_PIN);
  float ecVoltage = ecRaw * (5.0 / 1024.0);
  float ec = (ecVoltage * 2.0) / 1000.0;  // TDS 값을 EC로 변환 (간단한 공식)
  */
  float ec = 0.8 + (random(0, 80) / 100.0);  // 0.8 ~ 1.6 mS/cm 랜덤 값

  // pH 센서 읽기 (현재 연결 안 됨, 랜덤 데이터 생성)
  // 실제 센서 연결 시 아래 주석 해제
  /*
  int phRaw = analogRead(PH_PIN);
  float phVoltage = phRaw * (5.0 / 1024.0);
  float ph = 3.3 * phVoltage;  // pH 센서 보정 공식 (센서에 따라 다름)
  */
  float ph = 5.5 + (random(0, 30) / 10.0);  // 5.5 ~ 8.5 pH 랜덤 값

  // 온도/습도 유효성 검사
  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("DHT11 센서 읽기 실패!");
    return;
  }

  unsigned long timestamp = millis() / 1000;  // 초 단위 타임스탬프

  // 개별 센서 데이터 발행
  publishSensorData("temperature", temperature, "°C", timestamp);
  delay(100);
  publishSensorData("humidity", humidity, "%", timestamp);
  delay(100);
  publishSensorData("ec", ec, "mS/cm", timestamp);
  delay(100);
  publishSensorData("ph", ph, "pH", timestamp);

  // 모든 센서 데이터 통합 발행
  delay(100);
  publishAllSensorData(temperature, humidity, ec, ph, timestamp);

  // 시리얼 모니터 출력
  Serial.println("--- 센서 데이터 ---");
  Serial.print("온도: ");
  Serial.print(temperature);
  Serial.println(" °C");
  Serial.print("습도: ");
  Serial.print(humidity);
  Serial.println(" %");
  Serial.print("EC: ");
  Serial.print(ec);
  Serial.println(" mS/cm");
  Serial.print("pH: ");
  Serial.print(ph);
  Serial.println(" pH");
}

/*
 * 개별 센서 데이터 MQTT 발행
 */
void publishSensorData(const char* sensorType, float value, const char* unit, unsigned long timestamp) {
  StaticJsonDocument<200> doc;
  doc["sensor"] = sensorType;
  doc["value"] = value;
  doc["unit"] = unit;
  doc["timestamp"] = timestamp;

  char jsonBuffer[200];
  serializeJson(doc, jsonBuffer);

  String topic = "smartfarm/sensors/" + String(sensorType);
  mqttClient.publish(topic.c_str(), jsonBuffer);
}

/*
 * 모든 센서 데이터 통합 MQTT 발행
 */
void publishAllSensorData(float temperature, float humidity, float ec, float ph, unsigned long timestamp) {
  StaticJsonDocument<300> doc;
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  doc["ec"] = ec;
  doc["ph"] = ph;
  doc["timestamp"] = timestamp;

  char jsonBuffer[300];
  serializeJson(doc, jsonBuffer);

  mqttClient.publish("smartfarm/sensors/all", jsonBuffer);
}

