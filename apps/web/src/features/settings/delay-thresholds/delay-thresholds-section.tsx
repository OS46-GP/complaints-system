import { useEffect, useState } from "react";
import { AlertCircle, Gauge, Save } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AsyncLoader } from "@/components/shared/async-loader";
import {
  useDelayThresholds,
  useUpdateDelayThresholds,
} from "@/features/reporting/hooks";

const FIELDS: Array<{
  key: "lowDays" | "mediumDays" | "highDays";
  label: string;
  hint: string;
  chip: string;
}> = [
  {
    key: "highDays",
    label: "عالية",
    hint: "مدة الرد على الشكاوى عالية الأولوية",
    chip: "bg-red-500/10 text-red-600",
  },
  {
    key: "mediumDays",
    label: "متوسطة",
    hint: "مدة الرد على الشكاوى متوسطة الأولوية",
    chip: "bg-amber-500/10 text-amber-600",
  },
  {
    key: "lowDays",
    label: "منخفضة",
    hint: "مدة الرد على الشكاوى منخفضة الأولوية",
    chip: "bg-green-500/10 text-green-600",
  },
];

export function DelayThresholdsSection() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useDelayThresholds();
  const updateMutation = useUpdateDelayThresholds();

  const [values, setValues] = useState<{
    lowDays: number;
    mediumDays: number;
    highDays: number;
  } | null>(null);

  useEffect(() => {
    if (data) {
      setValues({
        lowDays: data.lowDays,
        mediumDays: data.mediumDays,
        highDays: data.highDays,
      });
    }
  }, [data]);

  const isValid =
    values !== null &&
    [values.lowDays, values.mediumDays, values.highDays].every(
      (v) => Number.isInteger(v) && v >= 1 && v <= 365,
    );

  const hasChanges =
    values !== null &&
    data !== undefined &&
    (values.lowDays !== data.lowDays ||
      values.mediumDays !== data.mediumDays ||
      values.highDays !== data.highDays);

  const handleSave = () => {
    if (!values || !isValid) return;
    updateMutation.mutate(values, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["settings-delay-thresholds"],
        });
        toast.success("تم حفظ عتبات التأخير بنجاح");
      },
      onError: () => toast.error("تعذر حفظ العتبات"),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Gauge className="size-4" />
          عتبات التأخير
        </CardTitle>
        <CardDescription>
          مدة الرد المتاحة لكل مستوى أولوية قبل اعتبار الشكوى متأخرة
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AsyncLoader
          loading={isLoading}
          error={isError}
          onRetry={() => refetch()}
          errorText="تعذر تحميل عتبات التأخير"
        >
          {values && (
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                {FIELDS.map(({ key, label, hint, chip }) => (
                  <div key={key} className="flex flex-col gap-2">
                    <Label
                      htmlFor={`threshold-${key}`}
                      className="flex items-center gap-2"
                    >
                      <span
                        className={cn(
                          "inline-flex h-6 items-center rounded-full px-2.5 font-mono text-mono-data",
                          chip,
                        )}
                      >
                        {label}
                      </span>
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id={`threshold-${key}`}
                        type="number"
                        min={1}
                        max={365}
                        dir="ltr"
                        className="w-28"
                        value={values[key]}
                        onChange={(e) =>
                          setValues((v) =>
                            v ? { ...v, [key]: Number(e.target.value) } : v,
                          )
                        }
                      />
                      <span className="text-label-sm text-muted-foreground">
                        يوم
                      </span>
                    </div>
                    <p className="text-label-xs text-muted-foreground">{hint}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 border-t border-border pt-4">
                <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-label-sm text-amber-700 dark:text-amber-400">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <span>
                    القيم الحالية قيم افتراضية مؤقتة — يجب اعتماد الأرقام النهائية مع
                    الجهة المختصة قبل اعتماد النظام.
                  </span>
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    className="gap-2"
                    disabled={!isValid || !hasChanges || updateMutation.isPending}
                    onClick={handleSave}
                  >
                    <Save className="size-4" />
                    {updateMutation.isPending
                      ? "جارٍ الحفظ..."
                      : "حفظ العتبات"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </AsyncLoader>
      </CardContent>
    </Card>
  );
}