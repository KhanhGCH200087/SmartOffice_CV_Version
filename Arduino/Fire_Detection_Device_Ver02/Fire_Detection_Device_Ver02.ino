#include <NTPClient.h>
#include <WiFiUdp.h>

#include <FirebaseESP8266.h>
#include <ESP8266WiFi.h>

#define FIREBASE_HOST ""
#define FIREBASE_AUTH ""
#define WIFI_SSID ""
#define WIFI_PASSWORD ""

#define AO_PIN A0  // kết nối A0 của Fire sensor với A0 của ESP8266

#define DO_PIN D7  // kết nối D0 của cảm biến gas MQ2 với D7 của ESP8266

FirebaseData firebaseData;

WiFiUDP u;
NTPClient n(u, "l.asia.pool.ntp.org", 7*3600); //khai báo try cập ntp server khu vực ASIA


void setup() {
  Serial.begin(9600);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD); // Connect to Wi-Fi

  // Wait for connection
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());

  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);

  n.begin(); //khởi động truy cập server thời gian

  //Khai báo kết nối cảm biến khí gas
  pinMode(DO_PIN, INPUT);
  delay(20000);  // wait for the MQ2 to warm up, cần để cảm biến chạy 1 lúc thì mới nhạy

  pinMode(D5, OUTPUT); //Buzz

  pinMode(D1, OUTPUT); //Blue
  pinMode(D2, OUTPUT); //Green
  pinMode(D3, OUTPUT); //Red


}

//có 2 device là Fire_Detection_Device_A và Fire_Detection_Device_A
void loop() {
  if(!Firebase.getString(firebaseData, "/device/Fire_Detection_Device_A/data")){
    Serial.print("Device is not exist in the firebase, create new ");
    createNewFirebase();
  }

  detectSensor();
  
}

void createNewFirebase(){
  int active = 2;
  String default_input = "null";
  String detect_danger = "no";
  String note = "Device is detect fire and warning";
  String type = "fire";
  int realtime = 0;

  Firebase.setInt(firebaseData, "/device/Fire_Detection_Device_A/active", active);
  Firebase.setString(firebaseData, "/device/Fire_Detection_Device_A/data", default_input);
  Firebase.setString(firebaseData, "/device/Fire_Detection_Device_A/detect_danger", detect_danger);
  Firebase.setString(firebaseData, "/device/Fire_Detection_Device_A/device_message", default_input);
  Firebase.setString(firebaseData, "/device/Fire_Detection_Device_A/device_message2", default_input);
  Firebase.setString(firebaseData, "/device/Fire_Detection_Device_A/note", note);
  Firebase.setString(firebaseData, "/device/Fire_Detection_Device_A/old_status", default_input);
  Firebase.setString(firebaseData, "/device/Fire_Detection_Device_A/type", type);
  Firebase.setInt(firebaseData, "/device/Fire_Detection_Device_A/realtime", realtime);

}

void detectSensor(){ //hàm dùng để phát hiện trong không khí có khí gas không (trường hợp dùng D0 của cảm biến khí gas MQ2)
  String default_input = "null";
  String fire_input = "Detect Fire";
  String old_status_fire = "fire";
  int minFlameValue = 999;
  int flameValue = analogRead(AO_PIN);
  int gasState = digitalRead(DO_PIN);

  if (gasState == HIGH && flameValue > minFlameValue){ //không có gì xảy ra
    Serial.println("The Gas or Fire is NOT present");

    digitalWrite(D5, LOW);
    digitalWrite(D1, HIGH);
    digitalWrite(D2, HIGH);
    digitalWrite(D3, LOW);

    Firebase.setString(firebaseData, "/device/Fire_Detection_Device_A/data", default_input);
    delay(1000);

  } else if(gasState == HIGH && flameValue < minFlameValue){ //không có gas nhưng có lửa
    Serial.println("The gas is NOT present but FIRE is present");
    digitalWrite(D1, LOW);
    digitalWrite(D2, LOW);

    digitalWrite(D3, HIGH);
    digitalWrite(D5, HIGH);
    delay(500);
    digitalWrite(D3, LOW);
    digitalWrite(D5, LOW);
    delay(500);
    digitalWrite(D3, HIGH);
    digitalWrite(D5, HIGH);
    delay(500);
    digitalWrite(D3, LOW);
    digitalWrite(D5, LOW);
    delay(500);
    digitalWrite(D3, HIGH);
    digitalWrite(D5, HIGH);
    delay(500);
    digitalWrite(D3, LOW);
    digitalWrite(D5, LOW);
    delay(500);
    digitalWrite(D3, HIGH);
    digitalWrite(D5, HIGH);
    delay(500);
    digitalWrite(D3, LOW);
    digitalWrite(D5, LOW);
    delay(500);
    digitalWrite(D3, HIGH);
    digitalWrite(D5, HIGH);
    delay(500);
    digitalWrite(D3, LOW);
    digitalWrite(D5, LOW);

    Firebase.setString(firebaseData, "/device/Fire_Detection_Device_A/data", fire_input);
    Firebase.setString(firebaseData, "/device/Fire_Detection_Device_A/old_status", old_status_fire);
    delay(2000);

  } else {
    Serial.println("Both Gas or Fire is present or only Gas");

    digitalWrite(D1, LOW);
    digitalWrite(D2, LOW);
    digitalWrite(D3, HIGH);

    digitalWrite(D3, HIGH);
    digitalWrite(D5, HIGH);
    delay(500);
    digitalWrite(D3, LOW);
    digitalWrite(D5, LOW);
    delay(500);
    digitalWrite(D3, HIGH);
    digitalWrite(D5, HIGH);
    delay(500);
    digitalWrite(D3, LOW);
    digitalWrite(D5, LOW);
    delay(500);
    digitalWrite(D3, HIGH);
    digitalWrite(D5, HIGH);
    delay(500);
    digitalWrite(D3, LOW);
    digitalWrite(D5, LOW);
    delay(500);
    digitalWrite(D3, HIGH);
    digitalWrite(D5, HIGH);
    delay(500);
    digitalWrite(D3, LOW);
    digitalWrite(D5, LOW);
    delay(500);
    digitalWrite(D3, HIGH);
    digitalWrite(D5, HIGH);
    delay(500);
    digitalWrite(D3, LOW);
    digitalWrite(D5, LOW);

    Firebase.setString(firebaseData, "/device/Fire_Detection_Device_A/data", fire_input);
    Firebase.setString(firebaseData, "/device/Fire_Detection_Device_A/old_status", old_status_fire);
    delay(2000);
  }
    
  
}





