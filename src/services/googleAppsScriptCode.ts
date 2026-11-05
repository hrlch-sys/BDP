export const GOOGLE_SHEET_SCHEMA_GUIDE = `
โครงสร้างตารางจัดเก็บข้อมูลใน Google Sheets สำหรับศูนย์บริการ เครือบ้านดอนปิยะ
========================================================================

ชีตที่ 1: "KPI_Targets" (ตารางเป้าหมายที่ผู้บริหารกำหนดรายไตรมาส)
----------------------------------------------------------------
คอลัมน์ A: ID (รหัสอ้างอิง เช่น target-nissan-surat-2026-q1-total_revenue)
คอลัมน์ B: ปี (Year เช่น 2026)
คอลัมน์ C: ไตรมาส (Quarter เช่น Q1, Q2, Q3, Q4)
คอลัมน์ D: บริษัท (Company เช่น บริษัท นิสสัน, บริษัท บีวายดี)
คอลัมน์ E: รหัสสาขา (Branch_ID เช่น nissan-surat)
คอลัมน์ F: ชื่อสาขา (Branch_Name เช่น สาขา สุราษฎร์ธานี)
คอลัมน์ G: รหัส KPI (KPI_Key เช่น labor_revenue, repair_orders)
คอลัมน์ H: ชื่อ KPI (KPI_Name เช่น รายได้ค่าแรง, รายได้อะไหล่)
คอลัมน์ I: เป้าหมาย (Target_Value ตัวเลข เช่น 1,200,000)
คอลัมน์ J: หน่วย (Unit เช่น บาท, คัน, %)
คอลัมน์ K: ผู้กำหนดเป้า (Updated_By)
คอลัมน์ L: วันที่แก้ไขล่าสุด (Updated_At)

ชีตที่ 2: "Monthly_Actuals" (ตารางบันทึกผลงานจริงรายเดือนจากผู้จัดการ)
----------------------------------------------------------------
คอลัมน์ A: ID (รหัสอ้างอิง เช่น act-2026-10-nissan-surat-labor_revenue)
คอลัมน์ B: ปี (Year)
คอลัมน์ C: เดือน (Month 1-12)
คอลัมน์ D: ชื่อเดือน (Month_Name เช่น มกราคม, ตุลาคม)
คอลัมน์ E: ไตรมาส (Quarter เช่น Q1, Q2, Q3, Q4)
คอลัมน์ F: บริษัท (Company)
คอลัมน์ G: รหัสสาขา (Branch_ID)
คอลัมน์ H: ชื่อสาขา (Branch_Name)
คอลัมน์ I: รหัส KPI (KPI_Key)
คอลัมน์ J: ชื่อ KPI (KPI_Name)
คอลัมน์ K: เป้าหมายรายเดือน (Monthly_Target = เป้าไตรมาส ÷ 3)
คอลัมน์ L: ผลดำเนินงานจริง (Actual_Value)
คอลัมน์ M: % บรรลุเป้า (% Achievement = L / K * 100)
คอลัมน์ N: ระดับผลงาน (Status: 🟢 เขียว ≥100% | 🟡 เหลือง 80-99% | 🔴 แดง <80%)
คอลัมน์ O: หมายเหตุ/คำชี้แจงจากผู้จัดการ (Manager_Notes)
คอลัมน์ P: ผู้บันทึกข้อมูล (Updated_By)
คอลัมน์ Q: วันเวลาที่บันทึก (Timestamp)

ชีตที่ 3: "Executive_Summary" (ตารางสูตรอัตโนมัติ สรุปภาพรวมและจัดระดับสี)
----------------------------------------------------------------
สรุปยอดเปรียบเทียบตาม 6 บริษัท และ 12 สาขา พร้อมใช้ Conditional Formatting 
ไฮไลต์เซลล์อัตโนมัติ (เขียว / เหลือง / แดง)
`;

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * =========================================================================
 * GOOGLE APPS SCRIPT (Code.gs)
 * ระบบ: รายงานผลดำเนินงานศูนย์บริการ เครือบ้านดอนปิยะ
 * ฝ่ายศูนย์บริการรายเดือน + ตั้งเป้าหมาย KPI + จัดระดับ เขียว/เหลือง/แดง
 * =========================================================================
 * 
 * วิธีติดตั้งใช้งาน:
 * 1. เปิด Google Sheet ใหม่ แล้วเปลี่ยนชื่อชีตเป็น "รายงานผลดำเนินงานศูนย์บริการ เครือบ้านดอนปิยะ"
 * 2. ไปที่เมนู "ส่วนขยาย" (Extensions) > "Apps Script"
 * 3. ลบโค้ดเดิมทั้งหมดใน Code.gs แล้ววางโค้ดชุดนี้ลงไปทั้งหมด
 * 4. กดบันทึก (Save)
 * 5. เลือกฟังก์ชัน "setupSheetDatabase" แล้วกด "เรียกใช้" (Run) 1 ครั้ง เพื่อสร้างตารางและหัวข้ออัตโนมัติ
 * 6. กดปุ่ม "ทำให้ใช้งานได้" (Deploy) > "การทำให้ใช้งานได้รายการใหม่" (New Deployment)
 *    - ประเภท: เว็บแอป (Web app)
 *    - เรียกใช้ในฐานะ: ฉัน (Me)
 *    - ผู้มีสิทธิ์เข้าถึง: ทุกคน (Anyone)
 * 7. คัดลอก "URL ของเว็บแอป" ที่ได้ มาวางในช่องเชื่อมต่อในหน้าเว็บแดชบอร์ดนี้
 */

const SHEET_TARGETS = "KPI_Targets";
const SHEET_ACTUALS = "Monthly_Actuals";
const SHEET_CONFIG = "Company_Branches";

/**
 * ฟังก์ชันสร้างโครงสร้างชีตและข้อมูลตั้งต้นอัตโนมัติ (รันครั้งแรกเพียง 1 ครั้ง)
 */
function setupSheetDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. สร้างชีต KPI_Targets
  let targetSheet = ss.getSheetByName(SHEET_TARGETS);
  if (!targetSheet) {
    targetSheet = ss.insertSheet(SHEET_TARGETS);
  }
  targetSheet.clear();
  const targetHeaders = [
    ["ID", "ปี (Year)", "ไตรมาส (Quarter)", "บริษัท (Company)", "รหัสสาขา (Branch ID)", 
     "ชื่อสาขา (Branch Name)", "รหัสตัวชี้วัด (KPI Key)", "ชื่อตัวชี้วัด (KPI Name)", 
     "เป้าหมาย (Target)", "หน่วย (Unit)", "ผู้กำหนดเป้า", "วันที่อัปเดต"]
  ];
  targetSheet.getRange(1, 1, 1, targetHeaders[0].length).setValues(targetHeaders)
    .setBackground("#dc2626")
    .setFontColor("#ffffff")
    .setFontWeight("bold");
  targetSheet.setFrozenRows(1);

  // 2. สร้างชีต Monthly_Actuals
  let actualSheet = ss.getSheetByName(SHEET_ACTUALS);
  if (!actualSheet) {
    actualSheet = ss.insertSheet(SHEET_ACTUALS);
  }
  actualSheet.clear();
  const actualHeaders = [
    ["ID", "ปี (Year)", "เดือน (Month)", "ชื่อเดือน", "ไตรมาส (Quarter)", 
     "บริษัท (Company)", "รหัสสาขา (Branch ID)", "ชื่อสาขา (Branch Name)", 
     "รหัสตัวชี้วัด (KPI Key)", "ชื่อตัวชี้วัด (KPI Name)", "เป้าหมายเดือน (Target)", 
     "ผลจริง (Actual)", "% บรรลุเป้า (% Achieved)", "ระดับผลงาน (Status)", 
     "หมายเหตุผู้จัดการ", "ผู้บันทึก", "วันเวลาที่บันทึก"]
  ];
  actualSheet.getRange(1, 1, 1, actualHeaders[0].length).setValues(actualHeaders)
    .setBackground("#991b1b")
    .setFontColor("#ffffff")
    .setFontWeight("bold");
  actualSheet.setFrozenRows(1);

  // 3. สร้างชีต Master สาขาในเครือบ้านดอนปิยะ
  let configSheet = ss.getSheetByName(SHEET_CONFIG);
  if (!configSheet) {
    configSheet = ss.insertSheet(SHEET_CONFIG);
  }
  configSheet.clear();
  const branchList = [
    ["รหัสบริษัท", "ชื่อบริษัท", "รหัสสาขา", "ชื่อสาขา"],
    ["nissan", "บริษัท นิสสัน", "nissan-nakhon", "สาขา นครศรีธรรมราช"],
    ["nissan", "บริษัท นิสสัน", "nissan-surat", "สาขา สุราษฎร์ธานี"],
    ["nissan", "บริษัท นิสสัน", "nissan-samui", "สาขา เกาะสมุย"],
    ["byd", "บริษัท บีวายดี", "byd-bangkung", "สาขา บางกุ้ง"],
    ["byd", "บริษัท บีวายดี", "byd-bangyai", "สาขา บางใหญ่"],
    ["geely", "บริษัท จีลี่", "geely-hq", "สาขา สำนักงานใหญ่"],
    ["lepas", "บริษัท เลพาส", "lepas-hq", "สาขา สำนักงานใหญ่"],
    ["zeekr", "บริษัท ซีกเกอร์", "zeekr-hq", "สาขา สำนักงานใหญ่"],
    ["zeekr", "บริษัท ซีกเกอร์", "zeekr-bp", "สาขา ศูนย์บริการ สีและตัวถัง"],
    ["zeekr", "บริษัท ซีกเกอร์", "zeekr-nakhon", "สาขา นครศรีธรรมราช"],
    ["zeekr", "บริษัท ซีกเกอร์", "zeekr-surat", "สาขา สุราษฎร์ธานี"],
    ["bandon_piya", "บริษัท บ้านดอนปิยะ", "bandon-hq", "สาขา สำนักงานใหญ่"]
  ];
  configSheet.getRange(1, 1, branchList.length, 4).setValues(branchList)
    .setFontFamily("Prompt");
  configSheet.getRange(1, 1, 1, 4).setBackground("#475569").setFontColor("#ffffff").setFontWeight("bold");
  configSheet.setFrozenRows(1);

  // เพิ่ม Conditional Formatting ในชีต Monthly_Actuals คอลัมน์ N (Status)
  applyConditionalFormatting(actualSheet);

  SpreadsheetApp.getUi().alert("สร้างชีตฐานข้อมูลเครือบ้านดอนปิยะเรียบร้อยแล้ว!");
}

/**
 * ใส่สีอัตโนมัติ: เขียว (>=100%), เหลือง (80-99%), แดง (<80%)
 */
function applyConditionalFormatting(sheet) {
  const range = sheet.getRange("N2:N1000");
  
  const ruleGreen = SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains("เขียว")
    .setBackground("#d1fae5")
    .setFontColor("#065f46")
    .setRanges([range])
    .build();

  const ruleYellow = SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains("เหลือง")
    .setBackground("#fef3c7")
    .setFontColor("#92400e")
    .setRanges([range])
    .build();

  const ruleRed = SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains("แดง")
    .setBackground("#fee2e2")
    .setFontColor("#991b1b")
    .setRanges([range])
    .build();

  sheet.setConditionalFormatRules([ruleGreen, ruleYellow, ruleRed]);
}

/**
 * API GET: เรียกดูข้อมูลทั้งหมดเพื่อไปแสดงในหน้าเว็บแดชบอร์ด
 */
function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const targetSheet = ss.getSheetByName(SHEET_TARGETS);
    const actualSheet = ss.getSheetByName(SHEET_ACTUALS);

    const targetsData = targetSheet ? targetSheet.getDataRange().getValues() : [];
    const actualsData = actualSheet ? actualSheet.getDataRange().getValues() : [];

    const result = {
      status: "success",
      appName: "รายงานผลดำเนินงานศูนย์บริการ เครือบ้านดอนปิยะ",
      targetsCount: Math.max(0, targetsData.length - 1),
      actualsCount: Math.max(0, actualsData.length - 1),
      timestamp: new Date().toISOString()
    };

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * API POST: รับข้อมูลการบันทึกผลงานจากผู้จัดการ หรือการตั้งเป้าหมายจากผู้บริหาร
 */
function doPost(e) {
  try {
    const contents = JSON.parse(e.postData.contents);
    const action = contents.action; // "save_actuals" หรือ "save_targets"
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === "save_actuals") {
      const sheet = ss.getSheetByName(SHEET_ACTUALS);
      const rows = contents.rows; // Array of actual records
      
      for (let i = 0; i < rows.length; i++) {
        const item = rows[i];
        
        // คำนวณสถานะ 3 ระดับ
        let status = "🔴 แดง (<80%)";
        if (item.achievementPct >= 100) {
          status = "🟢 เขียว (≥100%)";
        } else if (item.achievementPct >= 80) {
          status = "🟡 เหลือง (80-99%)";
        }

        sheet.appendRow([
          item.id || Utilities.getUuid(),
          item.year,
          item.month,
          item.monthName,
          item.quarter,
          item.companyName,
          item.branchId,
          item.branchName,
          item.kpiKey,
          item.kpiName,
          item.monthlyTarget,
          item.actualValue,
          item.achievementPct + "%",
          status,
          item.notes || "",
          item.updatedBy || "ผู้จัดการศูนย์บริการ",
          new Date()
        ]);
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "บันทึกผลการดำเนินงานเข้า Google Sheets เรียบร้อยแล้ว",
        savedCount: rows.length
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "save_targets") {
      const sheet = ss.getSheetByName(SHEET_TARGETS);
      const rows = contents.rows;
      for (let i = 0; i < rows.length; i++) {
        const t = rows[i];
        sheet.appendRow([
          t.id || Utilities.getUuid(),
          t.year,
          "Q" + t.quarter,
          t.companyName,
          t.branchId,
          t.branchName,
          t.kpiKey,
          t.kpiName,
          t.targetValue,
          t.unit,
          t.updatedBy || "ผู้บริหารเครือบ้านดอนปิยะ",
          new Date()
        ]);
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "บันทึกเป้าหมาย KPI เข้า Google Sheets เรียบร้อยแล้ว"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "Unknown action"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
`;
