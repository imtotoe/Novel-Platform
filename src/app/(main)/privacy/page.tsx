import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "นโยบายความเป็นส่วนตัว" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">นโยบายความเป็นส่วนตัว</CardTitle>
          <p className="text-sm text-muted-foreground">
            ปรับปรุงล่าสุด: 1 มีนาคม 2026
          </p>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-lg font-semibold">1. บทนำ</h2>
            <p>
              StoriWrite (&quot;เรา&quot;) ให้ความสำคัญกับความเป็นส่วนตัวของผู้ใช้งาน
              นโยบายนี้จัดทำขึ้นตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)
              เพื่ออธิบายวิธีที่เราเก็บรวบรวม ใช้ และปกป้องข้อมูลส่วนบุคคลของคุณ
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">2. ข้อมูลที่เราเก็บรวบรวม</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>ข้อมูลบัญชี: อีเมล, ชื่อผู้ใช้, ชื่อที่แสดง, รหัสผ่าน (เข้ารหัส)</li>
              <li>ข้อมูลโปรไฟล์: รูปภาพประจำตัว, ประวัติส่วนตัว</li>
              <li>เนื้อหา: นิยาย, ตอน, ความคิดเห็นที่คุณสร้างขึ้น</li>
              <li>กิจกรรม: ประวัติการอ่าน, ที่คั่นหน้า, การโหวต, การติดตาม</li>
              <li>ข้อมูลการชำระเงิน: ประวัติการซื้อ Coin (ข้อมูลบัตรจัดเก็บโดย Omise)</li>
              <li>ข้อมูลเทคนิค: IP address, ประเภทเบราว์เซอร์, คุกกี้</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">3. วัตถุประสงค์ในการใช้ข้อมูล</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>ให้บริการแพลตฟอร์มอ่านและเขียนนิยาย</li>
              <li>จัดการบัญชีผู้ใช้และยืนยันตัวตน</li>
              <li>ประมวลผลการชำระเงินและระบบ Coin</li>
              <li>แจ้งเตือนกิจกรรมที่เกี่ยวข้อง (ตอนใหม่, ความคิดเห็น, ผู้ติดตาม)</li>
              <li>ปรับปรุงและพัฒนาบริการ</li>
              <li>ป้องกันการละเมิดเงื่อนไขการใช้งาน</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">4. การเก็บรักษาข้อมูล</h2>
            <p>
              เราเก็บรักษาข้อมูลส่วนบุคคลตลอดระยะเวลาที่บัญชีของคุณยังเปิดใช้งานอยู่
              เมื่อคุณลบบัญชี ข้อมูลส่วนบุคคลจะถูกลบภายใน 30 วัน
              ยกเว้นข้อมูลที่จำเป็นต้องเก็บตามกฎหมาย (เช่น ข้อมูลการชำระเงินเก็บ 5 ปี)
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">5. สิทธิ์ของเจ้าของข้อมูล</h2>
            <p>ตาม PDPA คุณมีสิทธิ์ดังต่อไปนี้:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>สิทธิ์ในการเข้าถึง:</strong> ขอดูข้อมูลส่วนบุคคลของคุณ</li>
              <li><strong>สิทธิ์ในการแก้ไข:</strong> แก้ไขข้อมูลที่ไม่ถูกต้อง</li>
              <li><strong>สิทธิ์ในการลบ:</strong> ขอลบข้อมูลและบัญชีผู้ใช้</li>
              <li><strong>สิทธิ์ในการโอนย้าย:</strong> ดาวน์โหลดข้อมูลของคุณในรูปแบบ JSON</li>
              <li><strong>สิทธิ์ในการคัดค้าน:</strong> ปฏิเสธการใช้ข้อมูลเพื่อวัตถุประสงค์ทางการตลาด</li>
              <li><strong>สิทธิ์ในการถอนความยินยอม:</strong> เพิกถอนความยินยอมที่ให้ไว้ก่อนหน้า</li>
            </ul>
            <p className="mt-2">
              คุณสามารถใช้สิทธิ์เหล่านี้ผ่านหน้า &quot;ตั้งค่าบัญชี&quot; หรือติดต่อเราโดยตรง
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">6. คุกกี้</h2>
            <p>
              เราใช้คุกกี้ที่จำเป็นสำหรับการทำงานของเว็บไซต์ (เช่น session authentication)
              และคุกกี้วิเคราะห์เพื่อปรับปรุงบริการ คุณสามารถเลือกยอมรับหรือปฏิเสธคุกกี้
              ผ่านแบนเนอร์ขอความยินยอมเมื่อเข้าใช้งานครั้งแรก
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">7. การแบ่งปันข้อมูลกับบุคคลที่สาม</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Omise:</strong> ผู้ให้บริการชำระเงิน — ประมวลผลการซื้อ Coin</li>
              <li><strong>Supabase:</strong> ผู้ให้บริการฐานข้อมูล — จัดเก็บข้อมูลแพลตฟอร์ม</li>
              <li><strong>Vercel:</strong> ผู้ให้บริการโฮสติ้ง — ให้บริการเว็บไซต์</li>
            </ul>
            <p className="mt-2">
              เราไม่ขายหรือให้ข้อมูลส่วนบุคคลของคุณแก่บุคคลที่สามเพื่อวัตถุประสงค์ทางการตลาด
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">8. ความปลอดภัยของข้อมูล</h2>
            <p>
              เราใช้มาตรการรักษาความปลอดภัยที่เหมาะสม รวมถึงการเข้ารหัสรหัสผ่าน (bcrypt),
              การเชื่อมต่อ HTTPS, และการควบคุมการเข้าถึงตามบทบาท
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">9. เจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล (DPO)</h2>
            <p>
              หากมีคำถามเกี่ยวกับนโยบายนี้หรือต้องการใช้สิทธิ์ของคุณ กรุณาติดต่อ:
            </p>
            <p className="mt-1">
              อีเมล:{" "}
              <a href="mailto:dpo@storiwrite.com" className="text-primary hover:underline">
                dpo@storiwrite.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">10. การเปลี่ยนแปลงนโยบาย</h2>
            <p>
              เราอาจปรับปรุงนโยบายนี้เป็นครั้งคราว การเปลี่ยนแปลงที่สำคัญจะแจ้งผ่านอีเมล
              หรือการแจ้งเตือนบนแพลตฟอร์ม
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
