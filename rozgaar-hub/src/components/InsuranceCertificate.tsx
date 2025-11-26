import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Shield, Award } from "lucide-react";
import { useTranslation } from "react-i18next";

interface InsuranceCertificateProps {
  workerName: string;
  workerId: string;
  validThru: string;
}

export const InsuranceCertificate = ({ workerName, workerId, validThru }: InsuranceCertificateProps) => {
  const { t } = useTranslation();

  const handleDownload = () => {
    window.print();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-2 border-primary/20 shadow-lg print:shadow-none print:border-none">
      <CardHeader className="border-b bg-muted/10 print:bg-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-10 w-10 text-primary" />
            <div>
              <CardTitle className="text-2xl font-bold text-primary">RozgaarHub</CardTitle>
              <p className="text-sm text-muted-foreground">Worker Insurance Program</p>
            </div>
          </div>
          <Award className="h-12 w-12 text-yellow-500" />
        </div>
      </CardHeader>
      <CardContent className="p-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold uppercase tracking-wider text-primary/80">Certificate of Insurance</h2>
          <p className="text-muted-foreground">This certifies that the worker named below is covered under the RozgaarHub Group Insurance Policy.</p>
        </div>

        <div className="grid grid-cols-2 gap-8 py-6 border-y border-dashed">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Worker Name</p>
            <p className="text-lg font-semibold">{workerName}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Worker ID</p>
            <p className="text-lg font-mono font-semibold">{workerId}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Coverage Type</p>
            <p className="text-lg font-semibold">Accidental & Medical</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Valid Through</p>
            <p className="text-lg font-semibold">{validThru}</p>
          </div>
        </div>

        <div className="bg-primary/5 p-4 rounded-lg text-sm text-muted-foreground text-center">
          <p>Policy Number: RH-GRP-2025-8892</p>
          <p>Emergency Helpline: 9797653832</p>
        </div>

        <div className="flex justify-center print:hidden">
          <Button onClick={handleDownload} className="gap-2">
            <Download className="h-4 w-4" />
            {t("common.download", "Download Certificate")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
