#include <NTPClient.h>
#include <WiFiUdp.h>

#include <SPI.h>
#include <MFRC522.h>

#include <FirebaseESP8266.h>
#include <ESP8266WiFi.h>

#include <Wire.h>                 //Thư viện giao tiếp I2C
#include <LiquidCrystal_I2C.h>    //Thư viện LCD

#include <Servo.h> //Thư viện servo

#define SS_PIN D4 // SS pin for RC522 module, connected to D4
#define RST_PIN D3 // RST pin for RC522 module, connected to D3

MFRC522 mfrc522(SS_PIN, RST_PIN); // Create MFRC522 instance

#define FIREBASE_HOST ""
#define FIREBASE_AUTH ""
#define WIFI_SSID ""
#define WIFI_PASSWORD ""


FirebaseData firebaseData;

LiquidCrystal_I2C lcd(0x27,16,2); //Thiết lập địa chỉ và loại LCD
int totalColumns = 16;
int totalRows = 2;

Servo s1;  

WiFiUDP u;
NTPClient n(u, "l.asia.pool.ntp.org", 7*3600); //khai báo try cập ntp server khu vực ASIA


void setup() {
  Serial.begin(115200);
  SPI.begin(); // Init SPI bus
  mfrc522.PCD_Init(); // Init RC522
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

  //Display LCD
  Wire.begin(D1,D2);               //Thiết lập chân kết nối I2C (SDA,SCL);
  lcd.init();                      //Khởi tạo LCD
  lcd.clear();                     //Xóa màn hình
  lcd.backlight();                 //Bật đèn nền
  lcd.home();             
  //lcd.print("Ready To Read");
  
  n.begin(); //khởi động truy cập server thời gian

  s1.attach(15); //kết nối với chân D8, xem sơ đồ chân trên mạng là hiểu //servo

  pinMode(D0, OUTPUT); //còi

}
//chỉ có 1 device là CheckRFID_A
void loop() {
  if(!Firebase.getString(firebaseData, "/device/CheckRFID_A/data")){
    Serial.print("Device is not exist in the firebase, create new ");
    createNewFirebase();
  }

  lcd.display();

  if(Firebase.getString(firebaseData, "/device/CheckRFID_A/detect_danger")){
    String detect_danger_input = firebaseData.stringData();  
    String detect_danger_default = "no";
    if(detect_danger_input != detect_danger_default){
      lcd.clear();
      lcd.print("Danger Fire");
      s1.write(0);
      digitalWrite(D0, HIGH);
      delay(700);
      digitalWrite(D0, LOW);
      delay(700);
      digitalWrite(D0, HIGH);
      delay(700);
      digitalWrite(D0, LOW);
    } else {
      digitalWrite(D0, LOW);
      // sendRFIDtoFirebase();
      // Logic();
      newLogic();
    }
  }
  
}

void createNewFirebase(){
  int active = 2;
  String default_input = "null";
  String detect_danger = "no";
  String note = "Device is used to check RFID";
  String type = "rfid";
  int realtime = 0;

  Firebase.setInt(firebaseData, "/device/CheckRFID_A/active", active);
  Firebase.setString(firebaseData, "/device/CheckRFID_A/data", default_input);
  Firebase.setString(firebaseData, "/device/CheckRFID_A/detect_danger", detect_danger);
  Firebase.setString(firebaseData, "/device/CheckRFID_A/device_message", default_input);
  Firebase.setString(firebaseData, "/device/CheckRFID_A/device_message2", default_input);
  Firebase.setString(firebaseData, "/device/CheckRFID_A/image", default_input);
  Firebase.setString(firebaseData, "/device/CheckRFID_A/note", note);
  Firebase.setString(firebaseData, "/device/CheckRFID_A/type", type);
  Firebase.setInt(firebaseData, "/device/CheckRFID_A/realtime", realtime);

}

void scrollMessage(int row, String message, int delayTime, int totalColumns) {
  for (int i=0; i < totalColumns; i++) {
    message = " " + message;  
  } 
  message = message + " "; 
  for (int position = 0; position < message.length(); position++) {
    lcd.setCursor(0, row);
    lcd.print(message.substring(position, position + totalColumns));
    delay(delayTime);
  }
}

// void sendRFIDtoFirebase(){
//   if (mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial()) {
//     lcd.clear();
//     lcd.print("Reading the Card");
//     String rfidData = "";
//     for (byte i = 0; i < mfrc522.uid.size; i++) {
//       rfidData += String(mfrc522.uid.uidByte[i], HEX);
//     }
//     delay(500);
//     // Send RFID data to Firebase
//     lcd.clear();
//     lcd.print("Processing: ");
//     lcd.setCursor(0,1);              //Đặt vị trí ở ô thứ 1 trên dòng 2
//     lcd.print(rfidData);
//     delay(500);
    
//     Firebase.setString(firebaseData, "/device/CheckRFID_A/data", rfidData);
    
//     if (firebaseData.dataType() == "string") {
//       Serial.print("Data sent to Firebase: ");
//       Serial.println(firebaseData.stringData());

//       Serial.println(rfidData);

//       delay(500);
//       lcd.clear();
//       lcd.print("Done Reading");
//       delay(500);
//     } else {
//       Serial.println("Failed to send data to Firebase");
//       lcd.clear();
//       lcd.print("Error sending");
//       delay(5000);
//     }
//     delay(500); // Wait a bit before scanning for another card
//   }
// }

// void Logic(){
//   //!!!!!! Cần bổ sung thêm phần chụp ảnh, cần xử lý logic cách lấy ảnh và kết nối với ESP32 Cam
//   Firebase.getString(firebaseData, "/device/CheckRFID_A/data");
//   String input_data = firebaseData.stringData();

//   Firebase.getString(firebaseData, "/device/CheckRFID_A/detect_danger");
//   String input_detect_danger = firebaseData.stringData();

//   Firebase.getString(firebaseData, "/device/CheckRFID_A/device_message");
//   String input_device_message = firebaseData.stringData();

//   String default_input = "null";
//   String denied_message = "Denied Access";

//   //trường hợp hệ thống mặc định
//   if(input_data == default_input && input_device_message == default_input){ 
//     lcd.clear();
//     lcd.print("System Is Ready");
//     s1.write(180);  
//     delay(500);
//   }

//   //trường hợp được vào
//   if(input_data != default_input && input_device_message != denied_message && input_device_message != default_input){
//     lcd.clear();
//     lcd.setCursor(0,0);
//     lcd.print("Door is open");
//     digitalWrite(D0, HIGH);
//     delay(500);
//     digitalWrite(D0, LOW);
//     s1.write(0);
//     scrollMessage(1, input_device_message, 250, totalColumns);
//     delay(7000);
//     digitalWrite(D0, HIGH);
//     delay(500);
//     digitalWrite(D0, LOW);
//     s1.write(180);
//     lcd.clear();
//     lcd.setCursor(0,0);
//     lcd.print("Door is close");
//     delay(5000);
//     Firebase.setString(firebaseData, "/device/CheckRFID_A/data", default_input);
//     Firebase.setString(firebaseData, "/device/CheckRFID_A/device_message", default_input);
//     delay(500);
//   }

//   //trường hợp không được vào
//   if(input_data != default_input && input_device_message == denied_message && input_device_message != default_input){ 
//     lcd.clear();
//     lcd.print("Denied Access");
//     s1.write(180);
//     delay(500);
//     lcd.clear();
//     lcd.print("Processing");
//     digitalWrite(D0, HIGH);
//     delay(500);
//     digitalWrite(D0, LOW);
//     delay(500);
//     digitalWrite(D0, HIGH);
//     delay(500);
//     digitalWrite(D0, LOW);
//     delay(500);
//     Firebase.setString(firebaseData, "/device/CheckRFID_A/data", default_input);
//     Firebase.setString(firebaseData, "/device/CheckRFID_A/device_message", default_input);
    

//   }

// }

void newLogic(){
  Firebase.getString(firebaseData, "/device/CheckRFID_A/data");
  String input_data = firebaseData.stringData();

  Firebase.getString(firebaseData, "/device/CheckRFID_A/detect_danger");
  String input_detect_danger = firebaseData.stringData();

  Firebase.getString(firebaseData, "/device/CheckRFID_A/device_message");
  String input_device_message = firebaseData.stringData();

  String default_input = "null";
  String denied_message = "Denied Access";

  if (mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial()) {
    lcd.clear();
    lcd.print("Reading the Card");
    String rfidData = "";
    for (byte i = 0; i < mfrc522.uid.size; i++) {
      rfidData += String(mfrc522.uid.uidByte[i], HEX);
    }
    delay(500);
    // Send RFID data to Firebase
    lcd.clear();
    lcd.print("Processing: ");
    lcd.setCursor(0,1);              //Đặt vị trí ở ô thứ 1 trên dòng 2
    lcd.print(rfidData);
    delay(500);
    
    Firebase.setString(firebaseData, "/device/CheckRFID_A/data", rfidData);
    
    if (firebaseData.dataType() == "string") {
      Serial.print("Data sent to Firebase: ");
      Serial.println(firebaseData.stringData());

      Serial.println(rfidData);

      delay(500);
      lcd.clear();
      lcd.print("Done Reading");
      delay(500);
    } else {
      Serial.println("Failed to send data to Firebase");
      lcd.clear();
      lcd.print("Error sending");
      delay(5000);
    }
    delay(500); // Wait a bit before scanning for another card
  } else if(input_data != default_input && input_device_message != denied_message && input_device_message != default_input){
    lcd.clear();
    lcd.setCursor(0,0);
    lcd.print("Door is open");
    digitalWrite(D0, HIGH);
    delay(500);
    digitalWrite(D0, LOW);
    s1.write(0);
    scrollMessage(1, input_device_message, 250, totalColumns);
    delay(7000);
    digitalWrite(D0, HIGH);
    delay(500);
    digitalWrite(D0, LOW);
    s1.write(180);
    lcd.clear();
    lcd.setCursor(0,0);
    lcd.print("Door is close");
    delay(5000);
    Firebase.setString(firebaseData, "/device/CheckRFID_A/data", default_input);
    Firebase.setString(firebaseData, "/device/CheckRFID_A/device_message", default_input);
    delay(500);
  } else if(input_data != default_input && input_device_message == denied_message && input_device_message != default_input){ 
    lcd.clear();
    lcd.print("Denied Access");
    s1.write(180);
    delay(500);
    lcd.clear();
    lcd.print("Processing");
    digitalWrite(D0, HIGH);
    delay(500);
    digitalWrite(D0, LOW);
    delay(500);
    digitalWrite(D0, HIGH);
    delay(500);
    digitalWrite(D0, LOW);
    delay(500);
    Firebase.setString(firebaseData, "/device/CheckRFID_A/data", default_input);
    Firebase.setString(firebaseData, "/device/CheckRFID_A/device_message", default_input);
  } else if(input_data == default_input && input_device_message == default_input){ 
    lcd.clear();
    lcd.print("System Is Ready");
    s1.write(180);  
    delay(500);
  }
}



























