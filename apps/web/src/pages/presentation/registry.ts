import type { ComponentType } from "react";

import {
  AgendaSlide,
  AIAgentsSlide,
  AIMultiAgentObjectivesSlide,
  AIPipelineSlide,
  ArchitectureSlide,
  ConclusionSlide,
  DemoSlide,
  FeaturesSlide,
  FrontendAssignmentsSlide,
  FrontendComplaintDetailSlide,
  FrontendComplaintsSlide,
  FrontendDashboardSlide,
  FrontendDepartmentsSlide,
  FrontendHomeSlide,
  FrontendLettersSlide,
  FrontendNewComplaintSlide,
  FrontendOcrSlide,
  FrontendOverviewSlide,
  FrontendSocialSlide,
  FutureSlide,
  IntroductionSlide,
  ObjectivesSlide,
  ReferencesSlide,
  TechnologiesSlide,
  TestingSlide,
  ThanksSlide,
  TitleSlide,
} from "./slides";

export interface SlideDef {
  id: string;
  title: string;
  Component: ComponentType;
}

export const SLIDES: SlideDef[] = [
  { id: "title", title: "Title", Component: TitleSlide },
  { id: "agenda", title: "Agenda", Component: AgendaSlide },
  { id: "introduction", title: "Introduction", Component: IntroductionSlide },
  { id: "objectives", title: "Objectives", Component: ObjectivesSlide },
  { id: "ai-multi-objectives", title: "AI & Multi-Agent Objectives", Component: AIMultiAgentObjectivesSlide },
  { id: "technologies", title: "Technologies Used", Component: TechnologiesSlide },
  { id: "features", title: "System Features", Component: FeaturesSlide },
  { id: "architecture", title: "System Architecture", Component: ArchitectureSlide },
  { id: "ai-agents", title: "AI & Multi-Agents", Component: AIAgentsSlide },
  { id: "ai-rag", title: "Advanced RAG & Evaluation", Component: AIPipelineSlide },
  { id: "frontend-overview", title: "Frontend Overview", Component: FrontendOverviewSlide },
  { id: "fe-home", title: "Login & Home", Component: FrontendHomeSlide },
  { id: "fe-dashboard", title: "Dashboard", Component: FrontendDashboardSlide },
  { id: "fe-complaints", title: "Complaints List", Component: FrontendComplaintsSlide },
  { id: "fe-new-complaint", title: "New Complaint", Component: FrontendNewComplaintSlide },
  { id: "fe-detail", title: "Complaint Detail", Component: FrontendComplaintDetailSlide },
  { id: "fe-departments", title: "Departments & Reference Data", Component: FrontendDepartmentsSlide },
  { id: "fe-ocr", title: "OCR Intake", Component: FrontendOcrSlide },
  { id: "fe-assignments", title: "Due Assignments", Component: FrontendAssignmentsSlide },
  { id: "fe-letters", title: "Letter Templates", Component: FrontendLettersSlide },
  { id: "fe-social", title: "Social Monitoring", Component: FrontendSocialSlide },
  { id: "testing", title: "Testing", Component: TestingSlide },
  { id: "demo", title: "System Demonstration", Component: DemoSlide },
  { id: "future", title: "Future Enhancements", Component: FutureSlide },
  { id: "conclusion", title: "Conclusion", Component: ConclusionSlide },
  { id: "references", title: "References", Component: ReferencesSlide },
  { id: "thanks", title: "Thank You", Component: ThanksSlide },
];