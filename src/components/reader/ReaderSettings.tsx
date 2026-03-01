"use client";

import { forwardRef, useImperativeHandle, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Settings2, RotateCcw } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  useReaderSettings,
  type FontFamily,
  type ReadingTheme,
} from "@/lib/useReaderSettings";
import { cn } from "@/lib/utils";

export interface ReaderSettingsHandle {
  open: () => void;
}

const fontOptions: { value: FontFamily; label: string; className: string }[] = [
  { value: "sans", label: "Sans", className: "font-sans" },
  { value: "serif", label: "Serif", className: "font-serif" },
  { value: "sarabun", label: "Sarabun", className: "font-[Sarabun]" },
  { value: "mono", label: "Mono", className: "font-mono" },
];

const themeOptions: { value: ReadingTheme; label: string; bg: string; text: string }[] = [
  { value: "default", label: "ปกติ", bg: "bg-white dark:bg-zinc-900", text: "text-foreground" },
  { value: "sepia", label: "Sepia", bg: "bg-[#F5EFDC]", text: "text-[#5C4B3E]" },
  { value: "dark", label: "มืด", bg: "bg-[#1E1E1E]", text: "text-[#D4D4D4]" },
  { value: "night", label: "กลางคืน", bg: "bg-[#0A0A0A]", text: "text-[#A89B8C]" },
];

export const ReaderSettings = forwardRef<ReaderSettingsHandle>(function ReaderSettings(_, ref) {
  const s = useReaderSettings();
  const [open, setOpen] = useState(false);

  useImperativeHandle(ref, () => ({
    open: () => setOpen(true),
  }));

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings2 className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>ตั้งค่าการอ่าน</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6 px-4">
          {/* Reading Theme */}
          <section className="space-y-3">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              ธีมการอ่าน
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {themeOptions.map((t) => (
                <button
                  key={t.value}
                  onClick={() => s.setReadingTheme(t.value)}
                  className={cn(
                    "flex h-14 flex-col items-center justify-center rounded-lg border-2 text-xs transition-colors",
                    t.bg,
                    t.text,
                    s.readingTheme === t.value ? "border-primary" : "border-transparent"
                  )}
                >
                  Aa
                  <span className="mt-0.5 text-[10px]">{t.label}</span>
                </button>
              ))}
            </div>
          </section>

          <Separator />

          {/* Font Family */}
          <section className="space-y-3">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              แบบอักษร
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {fontOptions.map((f) => (
                <button
                  key={f.value}
                  onClick={() => s.setFontFamily(f.value)}
                  className={cn(
                    "rounded-md border px-3 py-2 text-sm transition-colors",
                    f.className,
                    s.fontFamily === f.value
                      ? "border-primary bg-primary/10"
                      : "hover:bg-accent"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </section>

          {/* Font Size */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                ขนาดตัวอักษร
              </Label>
              <span className="text-xs text-muted-foreground">{s.fontSize}px</span>
            </div>
            <Slider
              value={[s.fontSize]}
              onValueChange={([v]) => s.setFontSize(v)}
              min={12}
              max={32}
              step={1}
            />
          </section>

          <Separator />

          {/* Line Height */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                ระยะห่างบรรทัด
              </Label>
              <span className="text-xs text-muted-foreground">{s.lineHeight.toFixed(1)}</span>
            </div>
            <Slider
              value={[s.lineHeight * 10]}
              onValueChange={([v]) => s.setLineHeight(v / 10)}
              min={12}
              max={30}
              step={1}
            />
          </section>

          {/* Paragraph Spacing */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                ระยะห่างย่อหน้า
              </Label>
              <span className="text-xs text-muted-foreground">{s.paragraphSpacing.toFixed(1)}rem</span>
            </div>
            <Slider
              value={[s.paragraphSpacing * 10]}
              onValueChange={([v]) => s.setParagraphSpacing(v / 10)}
              min={0}
              max={30}
              step={1}
            />
          </section>

          {/* Max Width */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                ความกว้างเนื้อหา
              </Label>
              <span className="text-xs text-muted-foreground">{s.maxWidth}px</span>
            </div>
            <Slider
              value={[s.maxWidth]}
              onValueChange={([v]) => s.setMaxWidth(v)}
              min={600}
              max={1000}
              step={20}
            />
          </section>

          <Separator />

          {/* Eye Protection */}
          <section className="space-y-3">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              ปกป้องสายตา
            </Label>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs">ฟิลเตอร์แสงสีฟ้า</span>
                <span className="text-xs text-muted-foreground">{s.blueLightFilter}%</span>
              </div>
              <Slider
                value={[s.blueLightFilter]}
                onValueChange={([v]) => s.setBlueLightFilter(v)}
                min={0}
                max={100}
                step={5}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs">ความสว่าง</span>
                <span className="text-xs text-muted-foreground">{s.brightness}%</span>
              </div>
              <Slider
                value={[s.brightness]}
                onValueChange={([v]) => s.setBrightness(v)}
                min={50}
                max={150}
                step={5}
              />
            </div>
          </section>

          <Separator />

          {/* Immersive Mode */}
          <section className="space-y-3">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              โหมดอ่าน
            </Label>
            <button
              onClick={() => s.toggleImmersiveMode()}
              className={cn(
                "flex w-full items-center justify-between rounded-lg border-2 px-4 py-3 text-sm transition-colors",
                s.immersiveMode
                  ? "border-primary bg-primary/10"
                  : "border-transparent bg-accent hover:bg-accent/80"
              )}
            >
              <div className="text-left">
                <p className="font-medium">
                  {s.immersiveMode ? "📖 โหมดอ่านเต็มจอ" : "📖 โหมดอ่านเต็มจอ"}
                </p>
                <p className="text-xs text-muted-foreground">
                  ซ่อนเมนู/ฟุตเตอร์ แตะหน้าจอเพื่อแสดงเมนู
                </p>
              </div>
              <div
                className={cn(
                  "h-5 w-9 rounded-full transition-colors",
                  s.immersiveMode ? "bg-primary" : "bg-muted-foreground/30"
                )}
              >
                <div
                  className={cn(
                    "h-5 w-5 rounded-full bg-white shadow transition-transform",
                    s.immersiveMode ? "translate-x-4" : "translate-x-0"
                  )}
                />
              </div>
            </button>
          </section>

          <Separator />

          {/* Reset */}
          <Button
            variant="outline"
            className="w-full"
            onClick={s.resetAll}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            รีเซ็ตเป็นค่าเริ่มต้น
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
});
