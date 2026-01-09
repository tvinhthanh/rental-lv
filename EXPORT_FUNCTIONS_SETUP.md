# 📊 Export Excel/PDF Functions Setup

## 📦 Cài đặt Dependencies

### Backend
```bash
cd backend
npm install xlsx
npm install @types/xlsx --save-dev
```

### Frontend (nếu cần export từ client-side)
```bash
cd frontends
npm install xlsx
```

## 🔧 Backend Setup

### 1. Tạo Reports Module

Tạo file `backend/src/modules/reports/reports.controller.ts`:

```typescript
import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReportsService } from './reports.service';
import { Response } from 'express';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
    constructor(private reportsService: ReportsService) {}

    @Get('dashboard/export-excel')
    async exportDashboardExcel(@Res() res: Response) {
        const buffer = await this.reportsService.exportDashboardExcel();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=dashboard-report.xlsx');
        res.send(buffer);
    }

    @Get('invoices/export-excel')
    async exportInvoicesExcel(@Query() query: any, @Res() res: Response) {
        const buffer = await this.reportsService.exportInvoicesExcel(query);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=invoices-report.xlsx');
        res.send(buffer);
    }

    @Get('bookings/export-excel')
    async exportBookingsExcel(@Query() query: any, @Res() res: Response) {
        const buffer = await this.reportsService.exportBookingsExcel(query);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=bookings-report.xlsx');
        res.send(buffer);
    }
}
```

### 2. Tạo Reports Service

Tạo file `backend/src/modules/reports/reports.service.ts` với logic export sử dụng `xlsx` và `pdfkit`.

## 🎨 Frontend Setup

### 1. Tạo Export Service

File: `frontends/services/export.service.ts`

```typescript
import { APIRequest } from "@/lib/api";
const api = new APIRequest();

export const exportService = {
    exportDashboardExcel: () => {
        window.open(`${api.baseURL}/reports/dashboard/export-excel`, '_blank');
    },
    exportInvoicesExcel: (params?: Record<string, any>) => {
        const qs = params ? `?${new URLSearchParams(params as any).toString()}` : "";
        window.open(`${api.baseURL}/reports/invoices/export-excel${qs}`, '_blank');
    },
    exportBookingsExcel: (params?: Record<string, any>) => {
        const qs = params ? `?${new URLSearchParams(params as any).toString()}` : "";
        window.open(`${api.baseURL}/reports/bookings/export-excel${qs}`, '_blank');
    },
};
```

### 2. Tạo Export Buttons Component

File: `frontends/components/common/ExportButtons.tsx`

```typescript
"use client";

import { FileDown } from "lucide-react";
import { exportService } from "@/services/export.service";

interface ExportButtonsProps {
    type: "dashboard" | "invoices" | "bookings";
    params?: Record<string, any>;
}

export default function ExportButtons({ type, params }: ExportButtonsProps) {
    const handleExport = () => {
        if (type === "dashboard") {
            exportService.exportDashboardExcel();
        } else if (type === "invoices") {
            exportService.exportInvoicesExcel(params);
        } else if (type === "bookings") {
            exportService.exportBookingsExcel(params);
        }
    };

    return (
        <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold flex items-center gap-2"
        >
            <FileDown className="w-4 h-4" />
            Xuất Excel
        </button>
    );
}
```

## 📝 Usage

### Trong Dashboard Page
```tsx
import ExportButtons from "@/components/common/ExportButtons";

<ExportButtons type="dashboard" />
```

### Trong Invoices Page
```tsx
<ExportButtons type="invoices" params={{ branchId: "..." }} />
```

## ⚠️ Lưu ý

1. **Cần cài đặt xlsx library** trước khi sử dụng
2. **Backend cần tạo ReportsModule** và đăng ký trong `app.module.ts`
3. **PDF export** có thể sử dụng `pdfkit` đã có sẵn trong backend
4. **Authentication**: Export endpoints cần có JWT guard

## 🚀 Next Steps

1. Cài đặt xlsx: `npm install xlsx`
2. Tạo ReportsModule trong backend
3. Implement export logic trong ReportsService
4. Thêm ExportButtons vào các pages cần thiết
