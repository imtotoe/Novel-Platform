import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center px-4">
            <BookOpen className="h-16 w-16 text-muted-foreground/50" />
            <div>
                <h1 className="text-3xl font-bold">ไม่พบหน้าที่ต้องการ</h1>
                <p className="mt-2 text-muted-foreground">
                    หน้าที่คุณค้นหาอาจถูกลบ ย้าย หรือไม่มีอยู่
                </p>
            </div>
            <div className="flex gap-3">
                <Button asChild>
                    <Link href="/">กลับหน้าแรก</Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link href="/explore">สำรวจนิยาย</Link>
                </Button>
            </div>
        </div>
    );
}
