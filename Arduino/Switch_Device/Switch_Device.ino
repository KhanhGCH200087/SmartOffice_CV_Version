#include <NTPClient.h>

#include <FirebaseESP8266.h>

#include <ESP8266WiFi.h>
#include <WiFiUdp.h>

#define FIREBASE_HOST ""
#define FIREBASE_AUTH ""

 #define WIFI_SSID ""
 #define WIFI_PASSWORD ""

FirebaseData firebaseData;

WiFiUDP u;
NTPClient n(u, "l.asia.pool.ntp.org", 7*3600); //khai báo try cập ntp server khu vực ASIA

void setup() {
  Serial.begin(115200);
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

  //Control led over Firebase
  pinMode(D1, OUTPUT); //Led A
  pinMode(D2, OUTPUT); //Led B
  pinMode(D5, OUTPUT); //Led C
  pinMode(D6, OUTPUT);  //Led D

  n.begin(); //khởi động truy cập server thời gian
}

void loop() {
  if(!Firebase.getString(firebaseData, "/device/SwitchLedA/data")){
    Serial.print("Device is not exist in the firebase, create new SwitchLedA");
    createNewFirebaseSwitchLedA();
  }

  if(!Firebase.getString(firebaseData, "/device/SwitchLedB/data")){
    Serial.print("Device is not exist in the firebase, create new SwitchLedB");
    createNewFirebaseSwitchLedB();
  }

  if(!Firebase.getString(firebaseData, "/device/SwitchLedC/data")){
    Serial.print("Device is not exist in the firebase, create new SwitchLedC");
    createNewFirebaseSwitchLedC();
  }

  if(!Firebase.getString(firebaseData, "/device/SwitchLedD/data")){
    Serial.print("Device is not exist in the firebase, create new SwitchLedD");
    createNewFirebaseSwitchLedD();
  }

  n.update();
  int realtime = n.getSeconds();
  Firebase.setInt(firebaseData, "/device/SwitchLedA/realtime", realtime);
  Firebase.setInt(firebaseData, "/device/SwitchLedB/realtime", realtime);
  Firebase.setInt(firebaseData, "/device/SwitchLedC/realtime", realtime);
  Firebase.setInt(firebaseData, "/device/SwitchLedD/realtime", realtime);
  delay(250);

  Logic();

}

void createNewFirebaseSwitchLedA(){
  int active = 2;
  String data = "off";
  String detect_danger = "no";
  String note = "Device is used to turn on/off led";
  String default_input = "null";
  String type = "switch";
  int realtime = 0;

  Firebase.setInt(firebaseData, "/device/SwitchLedA/active", active);
  Firebase.setString(firebaseData, "/device/SwitchLedA/data", data);
  Firebase.setString(firebaseData, "/device/SwitchLedA/detect_danger", detect_danger);
  Firebase.setString(firebaseData, "/device/SwitchLedA/device_message", default_input);
  Firebase.setString(firebaseData, "/device/SwitchLedA/time_countdown", default_input);
  Firebase.setString(firebaseData, "/device/SwitchLedA/time_inching", default_input);
  Firebase.setString(firebaseData, "/device/SwitchLedA/note", note);
  Firebase.setInt(firebaseData, "/device/SwitchLedA/realtime", realtime);
  Firebase.setString(firebaseData, "/device/SwitchLedA/old_status", data);
  Firebase.setString(firebaseData, "/device/SwitchLedA/type", type);

}

void createNewFirebaseSwitchLedB(){
  int active = 2;
  String data = "off";
  String detect_danger = "no";
  String note = "Device is used to turn on/off led";
  String default_input = "null";
  String type = "switch";
  int realtime = 0;

  Firebase.setInt(firebaseData, "/device/SwitchLedB/active", active);
  Firebase.setString(firebaseData, "/device/SwitchLedB/data", data);
  Firebase.setString(firebaseData, "/device/SwitchLedB/detect_danger", detect_danger);
  Firebase.setString(firebaseData, "/device/SwitchLedB/device_message", default_input);
  Firebase.setString(firebaseData, "/device/SwitchLedB/time_countdown", default_input);
  Firebase.setString(firebaseData, "/device/SwitchLedB/time_inching", default_input);
  Firebase.setString(firebaseData, "/device/SwitchLedB/note", note);
  Firebase.setInt(firebaseData, "/device/SwitchLedB/realtime", realtime);
  Firebase.setString(firebaseData, "/device/SwitchLedB/old_status", data);
  Firebase.setString(firebaseData, "/device/SwitchLedB/type", type);

}

void createNewFirebaseSwitchLedC(){
  int active = 2;
  String data = "off";
  String detect_danger = "no";
  String note = "Device is used to turn on/off led";
  String default_input = "null";
  String type = "switch";
  int realtime = 0;

  Firebase.setInt(firebaseData, "/device/SwitchLedC/active", active);
  Firebase.setString(firebaseData, "/device/SwitchLedC/data", data);
  Firebase.setString(firebaseData, "/device/SwitchLedC/detect_danger", detect_danger);
  Firebase.setString(firebaseData, "/device/SwitchLedC/device_message", default_input);
  Firebase.setString(firebaseData, "/device/SwitchLedC/time_countdown", default_input);
  Firebase.setString(firebaseData, "/device/SwitchLedC/time_inching", default_input);
  Firebase.setString(firebaseData, "/device/SwitchLedC/note", note);
  Firebase.setInt(firebaseData, "/device/SwitchLedC/realtime", realtime);
  Firebase.setString(firebaseData, "/device/SwitchLedC/old_status", data);
  Firebase.setString(firebaseData, "/device/SwitchLedC/type", type);

}

void createNewFirebaseSwitchLedD(){
  int active = 2;
  String data = "off";
  String detect_danger = "no";
  String note = "Device is used to turn on/off led";
  String default_input = "null";
  String type = "switch";
  int realtime = 0;

  Firebase.setInt(firebaseData, "/device/SwitchLedD/active", active);
  Firebase.setString(firebaseData, "/device/SwitchLedD/data", data);
  Firebase.setString(firebaseData, "/device/SwitchLedD/detect_danger", detect_danger);
  Firebase.setString(firebaseData, "/device/SwitchLedD/device_message", default_input);
  Firebase.setString(firebaseData, "/device/SwitchLedD/time_countdown", default_input);
  Firebase.setString(firebaseData, "/device/SwitchLedD/time_inching", default_input);
  Firebase.setString(firebaseData, "/device/SwitchLedD/note", note);
  Firebase.setInt(firebaseData, "/device/SwitchLedD/realtime", realtime);
  Firebase.setString(firebaseData, "/device/SwitchLedD/old_status", data);
  Firebase.setString(firebaseData, "/device/SwitchLedD/type", type);

}

void Logic(){
  Firebase.getString(firebaseData, "/device/SwitchLedA/data");
  String status_ledA = firebaseData.stringData();  

  Firebase.getString(firebaseData, "/device/SwitchLedB/data");
  String status_ledB = firebaseData.stringData();  

  Firebase.getString(firebaseData, "/device/SwitchLedC/data");
  String status_ledC = firebaseData.stringData(); 

  Firebase.getString(firebaseData, "/device/SwitchLedD/data");
  String status_ledD = firebaseData.stringData();  


  String led_on = "on";
  String led_off = "off";

  if(status_ledA == led_on){
    digitalWrite(D1, HIGH);
  } else if(status_ledA == led_off){
    digitalWrite(D1, LOW);
  }

  if(status_ledB == led_on){
    digitalWrite(D2, HIGH);
  } else if(status_ledB == led_off){
    digitalWrite(D2, LOW);
  }

  if(status_ledC == led_on){
    digitalWrite(D5, HIGH);
  } else if(status_ledC == led_off){
    digitalWrite(D5, LOW);
  }

  if(status_ledD == led_on){
    digitalWrite(D6, HIGH);
  } else if(status_ledD == led_off){
    digitalWrite(D6, LOW);
  }

}

































