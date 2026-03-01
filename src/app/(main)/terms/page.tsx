import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "เงื่อนไขการใช้งาน" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">เงื่อนไขการใช้งาน</CardTitle>
          <p className="text-sm text-muted-foreground">
            ปรับปรุงล่าสุด: 1 มีนาคม 2026
          </p>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-lg font-semibold">1. การยอมรับเงื่อนไข</h2>
            <p>
              การสมัครสมาชิกและใช้งาน StoriWrite (&quot;แพลตฟอร์ม&quot;) ถือว่าคุณยอมรับ
              เงื่อนไขการใช้งานฉบับนี้ทั้งหมด หากไม่ยอมรับ กรุณาหยุดใช้งานแพลตฟอร์ม
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">2. คุณสมบัติผู้ใช้งาน</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>ผู้ใช้ต้องมีอายุ 13 ปีขึ้นไป</li>
              <li>ผู้ใช้ที่อายุต่ำกว่า 20 ปี ต้องได้รับความยินยอมจากผู้ปกครอง</li>
              <li>ข้อมูลที่ให้ต้องเป็นความจริงและเป็นปัจจุบัน</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">3. บัญชีผู้ใช้</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>ผู้ใช้แต่ละคนสามารถมีได้ 1 บัญชี</li>
              <li>คุณต้องรักษาความลับของรหัสผ่านและรับผิดชอบกิจกรรมทั้งหมดภายใต้บัญชีของคุณ</li>
              <li>ห้ามแบ่งปันบัญชีหรือโอนบัญชีให้ผู้อื่น</li>
              <li>เราสงวนสิทธิ์ระงับหรือปิดบัญชีที่ละเมิดเงื่อนไข</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">4. เนื้อหาและทรัพย์สินทางปัญญา</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>ผู้เขียนเป็นเจ้าของลิขสิทธิ์ในนิยายที่ตนเองสร้างขึ้น</li>
              <li>การเผยแพร่บนแพลตฟอร์มถือว่าคุณอนุญาตให้เราแสดงเนื้อหาแก่ผู้ใช้คนอื่น</li>
              <li>ห้ามเผยแพร่เนื้อหาที่ละเมิดลิขสิทธิ์ของผู้อื่น</li>
              <li>ห้ามคัดลอก ทำซ้ำ หรือดัดแปลงนิยายของผู้เขียนคนอื่นโดยไม่ได้รับอนุญาต</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">5. นโยบายเนื้อหา</h2>
            <p>ห้ามเผยแพร่เนื้อหาที่:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>เป็นสแปมหรือโฆษณาที่ไม่ได้รับอนุญาต</li>
              <li>มีเนื้อหาลามกอนาจาร หรือเนื้อหาที่ไม่เหมาะสมสำหรับเด็ก โดยไม่ติดป้ายเตือน</li>
              <li>ยุยงให้เกิดความรุนแรง เหยียดเชื้อชาติ หรือเลือกปฏิบัติ</li>
              <li>ละเมิดกฎหมายไทยหรือกฎหมายระหว่างประเทศ</li>
              <li>เผยแพร่ข้อมูลส่วนบุคคลของผู้อื่นโดยไม่ได้รับอนุญาต</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">6. ระบบ Coin และการชำระเงิน</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Coin เป็นสกุลเงินเสมือนใช้ภายในแพลตฟอร์มเท่านั้น</li>
              <li>Coin ที่ซื้อแล้วไม่สามารถขอคืนเป็นเงินสดได้ ยกเว้นกรณีที่กฎหมายกำหนด</li>
              <li>การชำระเงินผ่านผู้ให้บริการ Omise ภายใต้มาตรฐาน PCI-DSS</li>
              <li>นักเขียนได้รับส่วนแบ่งรายได้ 70% จาก Coin ที่ผู้อ่านใช้ซื้อตอน</li>
              <li>การถอนรายได้ขั้นต่ำ 100 บาท ผ่านบัญชีธนาคารไทย</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">7. การยกเลิกและระงับบัญชี</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>คุณสามารถลบบัญชีได้ตลอดเวลาผ่านหน้าตั้งค่า</li>
              <li>เราสงวนสิทธิ์ระงับบัญชีที่ละเมิดเงื่อนไข โดยแจ้งเหตุผลล่วงหน้า</li>
              <li>Coin คงเหลือจะไม่สามารถคืนได้หากบัญชีถูกระงับเนื่องจากการละเมิด</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">8. ข้อจำกัดความรับผิด</h2>
            <p>
              StoriWrite ให้บริการ &quot;ตามสภาพ&quot; (as-is) เราไม่รับประกันว่าบริการ
              จะปราศจากข้อผิดพลาดหรือให้บริการได้อย่างต่อเนื่อง เราไม่รับผิดชอบต่อเนื้อหา
              ที่ผู้ใช้สร้างขึ้นบนแพลตฟอร์ม
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">9. กฎหมายที่ใช้บังคับ</h2>
            <p>
              เงื่อนไขนี้อยู่ภายใต้กฎหมายแห่งราชอาณาจักรไทย
              ข้อพิพาทใด ๆ จะอยู่ในเขตอำนาจศาลไทย
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">10. การติดต่อ</h2>
            <p>
              หากมีคำถามเกี่ยวกับเงื่อนไขนี้ กรุณาติดต่อ:{" "}
              <a href="mailto:contact@storiwrite.com" className="text-primary hover:underline">
                contact@storiwrite.com
              </a>
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
