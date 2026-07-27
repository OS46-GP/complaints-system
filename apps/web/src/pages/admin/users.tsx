import { Link } from "react-router";
import { Plus } from "lucide-react";

import { PATHS } from "@/router/paths";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import type { User } from "@/features/user-list/types";
import { UserList } from "@/features/user-list/user-list";

const mockUsers: User[] = [
  {
    id: "1",
    name: "سارة القحطاني",
    email: "sara.q@system.gov.sa",
    role: "مدير فريق",
    roleTitle: "مدير فريق العمليات",
    department: "العمليات المركزية",
    activeCases: 12,
    activeCasesMax: 16,
    status: "online",
    lastSeen: "منذ دقيقتين",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB7hp7W2pkhKamohxZlEJMZrDaOFwBiEBLa5dmoaYSoMxGBN1Lcg9UrWfc-GiuGL6aOiVp1nIdAKTVRkjX18f77V3xXjPV9A5kMD54PaoU4atZh8NrfGCxP5VlbnX9GxgOLIEvorAb5GmFensJtscqnxQL_jLjozM3R22ptj54B-dRMZEJId1TX5bqv8csmzs2aZBz6YliruwApHNarrJVbXgN5O1rAbJvrfQoNSwVhO8rkhxdqwhxigLe2zRQn11zRj20BBntPOEs",
  },
  {
    id: "2",
    name: "خالد الهاشم",
    email: "k.hashem@system.gov.sa",
    role: "أخصائي شكاوى",
    roleTitle: "أخصائي شكاوى كبار الشخصيات",
    department: "الدعم الفني",
    activeCases: 28,
    activeCasesMax: 32,
    status: "online",
    lastSeen: "منذ ساعة",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC8CaZDgCBr99lf8ACTDtR9Hj6M-a5I_4ad-qssunG3U5ud5r-BTUlcGWHRh5SSM09n1gGWxqKakaJ1Qj7E1vsDrQiW9KsA6Ttg0E2HPQH8mcGw-dybyyDeDQcM62jmGGtentHWWJHWDTeJ1R-GfngaO5KNMmWchBKB3jhMdjN0N-jtvtLiBSws_J5J5iyEOCB8BXNwSa1HdMkcYMvrCeBlJNJ69Vs01bm48Kh2R2BzWBRRUb1Wr1zi7fuBQyiuCxlJMcoo8t73LYM",
  },
  {
    id: "3",
    name: "ليلى المطيري",
    email: "l.mutairi@system.gov.sa",
    role: "مدقق جودة",
    roleTitle: "محلل جودة الأداء",
    department: "قسم العمليات",
    activeCases: 5,
    activeCasesMax: 16,
    status: "offline",
    lastSeen: "14 أكتوبر 2023",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDFpexkM-WYQy09k2wTDbDE-yNg42bnH6-te_RcJEs9zW6JQ8eozAnyrYz1-JQlbAga3sqUXMMukJnc9G0-W1ww3bgBNZMXX441kuX-zlu4Aw7PZcmE5BahxJhqlzesheo-rbhaFOiWeXkswtrmINI1EFaQlI8LrK71giv7KmppTSg9YlTmlJj9YEb4lomOW6iDS21D32BKC1wv0cHtkorMv6322NTRDsca4h1lVDMADyfG2yqaOelQr4akvGCmjBsxYnXleuUps9Q",
  },
  {
    id: "4",
    name: "عبدالرحمن اليوسف",
    email: "a.yousef@system.gov.sa",
    role: "أخصائي شكاوى",
    roleTitle: "أخصائي شكاوى الخدمات",
    department: "خدمة العملاء",
    activeCases: 19,
    activeCasesMax: 32,
    status: "online",
    lastSeen: "منذ 15 دقيقة",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDJmHuVIBIxNcqVxXcEkAe3oTL_40EpEfuX3KFco7GcQXCymndx4ogoM1vCWto8QhSqXatsYU1VfeoiTN474nkwlfmhIBByLgWxzaBxfLC39vA2_pT0x1j9TdJgqEfFtanZMrXRxC3e_NOTw4USgo5GUP1zGe_bDW2c5zUiydLFHc-E6aFFN-AovVjWHerpKW4QFfo23AfZEr43t5J5nPevSrT8E-SIUWsUbVxEETMWh2uQ7tqxlKTD_LmKuAGnzE_pWO7bb3s9nRw",
  },
  {
    id: "5",
    name: "ليلى حسن",
    email: "l.hassan@system.gov.sa",
    role: "مدير فريق",
    roleTitle: "مدير فريق العمليات",
    department: "العمليات المركزية",
    activeCases: 12,
    activeCasesMax: 15,
    status: "online",
    lastSeen: "منذ 5 دقائق",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCqlZfVhHjVrsMI-bvXcpfwBJHY5JkI5mxBq4Tl010uKDc_M9R7oMDinBN_FIG4TACW91H7vj0P1_uGOztotcjQzZOCkRlvxenPZHWEoF-GRuzhbxq0E-W7iO3uNdYPRPiWICgAq29a0OMcuvBqBU_nL8AQYxBGUL8yrCsdX1T9s2kRlgukQPsohO7ikZ_lWuSDJGmcWMh_Bf_8sWxAo_pYa0WTRXjPZnPY40jE4brf4fMmfkWnyjwbN9IywEFv-tfiyPfbdkOFl5s",
  },
  {
    id: "6",
    name: "أحمد منصور",
    email: "a.mansour@system.gov.sa",
    role: "أخصائي شكاوى",
    roleTitle: "أخصائي شكاوى كبار الشخصيات",
    department: "الدعم المتقدم",
    activeCases: 5,
    activeCasesMax: 15,
    status: "offline",
    lastSeen: "منذ 3 ساعات",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAEBpDfl_IIhLdWjY7norpRvSXfBSjvPNG6bYQifTOmdwzfLuPhVLT9qRkp6wMh9d5XAJcMz9Mitz0-233rX-37xRXpIXLNDtcIhyA837TA_FxjvjPZpVnYwvyBH0lN6NzAZc6xdeZH74Pbqnnmtt2--AU29VTz7zOxbWAcWoy4qy-9gSl1mASQaiIpbZeQ0d-94QuW4o6wqERU-K8tx_OHyyhPAEhMHcJeW6sbMbDMzL5fIz0wPLVJhigUv1DAc6lg94snMPZtR2U",
  },
  {
    id: "7",
    name: "سارة الغامدي",
    email: "s.ghamdi@system.gov.sa",
    role: "محلل جودة",
    roleTitle: "محلل جودة الأداء",
    department: "الجودة والامتثال",
    activeCases: 14,
    activeCasesMax: 15,
    status: "online",
    lastSeen: "منذ دقيقة",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAIc-vlwP8ItJMTMPlZfLysZwrgaaI_obEfSfr1GvBCbJlSi2IADuyow9x8DV-keNzY7TKq0GDqWL9FGvtPCrmrPjEX66y4JPkl8_cQ9KNfAFhA8TOsPTp4TQQ6TV8yW5uawu7zqRx3iwqq1tBLzQ1ZIXEvFencPb-0JdjBWoQsQFVb1svcK2ztwTeF0pD7iGecMqQcTGpeSd5VC69IXRMey41in8Sf0RHs3qzJvHxruOwTgj3bBdHTETxCtT4Q9iwi4Pt6NN7bTxQ",
  },
];

export default function AdminUsers() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="إدارة طاقم العمل"
        description="تنظيم الصلاحيات ومتابعة أداء الموظفين في معالجة الشكاوى"
      >
        <Button asChild className="gap-2">
          <Link to={PATHS.ADMIN.NEW_USER}>
            <Plus className="size-5" />
            <span>دعوة موظف جديد</span>
          </Link>
        </Button>
      </PageHeader>

      <UserList
        users={mockUsers}
        totalPages={13}
        totalCount={124}
        pageSize={10}
      />
    </div>
  );
}
