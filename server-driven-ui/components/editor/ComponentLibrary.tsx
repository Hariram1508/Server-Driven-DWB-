"use client";

import React from "react";
import { useEditor, Element } from "@craftjs/core";
import {
  Layout,
  Type,
  Image as ImageIcon,
  Plus,
  Box,
  Info,
  Users,
  HelpCircle,
  Mail,
  MousePointer2,
  Search,
  Layers,
  Video as VideoIcon,
} from "lucide-react";
import { HeroBanner } from "../builder-components/HeroBanner";
import { TextBlock } from "../builder-components/TextBlock";
import { Container } from "../builder-components/Container";
import { AboutSection } from "../builder-components/AboutSection";
import { Statistics } from "../builder-components/Statistics";
import { FacultyGrid } from "../builder-components/FacultyGrid";
import { FAQAccordion } from "../builder-components/FAQAccordion";
import { ContactForm } from "../builder-components/ContactForm";
import { Button } from "../builder-components/Button";
import { ActionButton } from "../builder-components/ActionButton";
import { RawHTML } from "../builder-components/RawHTML";
import { Section } from "../builder-components/Section";
import { Grid } from "../builder-components/Grid";
import { Image } from "../builder-components/Image";
import { Video } from "../builder-components/Video";
import { Heading } from "../builder-components/Heading";
import { Card } from "../builder-components/Card";
import { Spacer } from "../builder-components/Spacer";
import { Paragraph } from "../builder-components/Paragraph";
import {
  AdmissionForm,
  AlertBanner,
  AnnouncementBanner,
  Badge,
  Breadcrumb,
  ClubCard,
  CourseList,
  DepartmentCard,
  Divider,
  EventCalendar,
  ExamSchedule,
  FacilityCard,
  FacultyProfile,
  FeedbackForm,
  Footer,
  GridSection,
  Gallery,
  InquiryForm,
  Modal,
  Navbar,
  Pagination,
  PlacementStats,
  ProgressTracker,
  Quote,
  ScholarshipCard,
  Sidebar,
  Stack,
  StudentTestimonial,
  Tabs,
  Testimonial,
  Timeline,
  Tooltip,
} from "../builder-components/Phase1Expansion";
import { ComponentMapper } from "../renderer/ComponentMapper";
import * as aiApi from "@/lib/api/ai.api";
import { Sparkles, Code } from "lucide-react";

type CustomComponentItem = {
  type: string;
  name: string;
  description: string;
  props: Record<string, unknown>;
};

export const ComponentLibrary = () => {
  const { connectors } = useEditor();
  const [search, setSearch] = React.useState("");
  const [customComponents, setCustomComponents] = React.useState<
    CustomComponentItem[]
  >([]);

  React.useEffect(() => {
    const fetchCustom = async () => {
      try {
        const response = await aiApi.getCustomComponents();
        if (response.success && response.data) {
          setCustomComponents(response.data as CustomComponentItem[]);
        }
      } catch (error) {
        console.error("Failed to fetch custom components:", error);
      }
    };

    fetchCustom();

    // Listen for new generations
    window.addEventListener("customComponentGenerated", fetchCustom);
    return () =>
      window.removeEventListener("customComponentGenerated", fetchCustom);
  }, []);

  const components = [
    {
      category: "Layout",
      name: "Hero Banner",
      icon: <ImageIcon className="w-5 h-5 text-purple-500" />,
      component: <HeroBanner />,
      description: "Main landing section with title and background.",
    },
    {
      category: "Layout",
      name: "Section",
      icon: <Layers className="w-5 h-5 text-slate-500" />,
      component: (
        <Element is={Section} canvas>
          <div className="p-10 text-center text-gray-400 border border-dashed rounded-xl italic">
            Drop components here
          </div>
        </Element>
      ),
      description: "Flexible full-width section for grouped content.",
    },
    {
      category: "Layout",
      name: "Grid",
      icon: <Layout className="w-5 h-5 text-blue-500" />,
      component: (
        <Element is={Grid} canvas>
          <div className="p-6 text-center text-gray-400 border border-dashed rounded-xl italic">
            Drop components here
          </div>
        </Element>
      ),
      description: "Responsive grid layout for two or more columns.",
    },
    {
      category: "Layout",
      name: "Container",
      icon: <Box className="w-5 h-5 text-green-500" />,
      component: (
        <Element is={Container} canvas>
          <div className="p-10 text-center text-gray-400 border border-dashed rounded italic">
            Drop components here
          </div>
        </Element>
      ),
      description: "A layout container to hold other components.",
    },
    {
      category: "Layout",
      name: "Card",
      icon: <Box className="w-5 h-5 text-sky-500" />,
      component: (
        <Element is={Card} canvas>
          <div className="p-6 text-center text-gray-400 border border-dashed rounded italic text-sm">
            Card content
          </div>
        </Element>
      ),
      description: "A styled card container with padding and shadow.",
    },
    {
      category: "Layout",
      name: "Spacer",
      icon: <Layout className="w-5 h-5 text-gray-500" />,
      component: <Spacer />,
      description: "Add vertical or horizontal spacing between components.",
    },
    {
      category: "Layout",
      name: "Sidebar",
      icon: <Layout className="w-5 h-5 text-slate-600" />,
      component: (
        <Element is={Sidebar} canvas>
          <div className="p-4 text-center text-gray-400 border border-dashed rounded-xl italic">
            Sidebar content
          </div>
        </Element>
      ),
      description: "Side panel container for navigation or quick links.",
    },
    {
      category: "Layout",
      name: "Stack",
      icon: <Layout className="w-5 h-5 text-blue-600" />,
      component: (
        <Element is={Stack} canvas>
          <div className="p-4 text-center text-gray-400 border border-dashed rounded-xl italic">
            Stack children
          </div>
        </Element>
      ),
      description: "Vertical stack canvas for grouped blocks.",
    },
    {
      category: "Layout",
      name: "Divider",
      icon: <Layout className="w-5 h-5 text-gray-400" />,
      component: <Divider />,
      description: "Thin horizontal separator line.",
    },
    {
      category: "Content",
      name: "Heading",
      icon: <Type className="w-5 h-5 text-teal-500" />,
      component: <Heading />,
      description: "Customizable heading from H1 to H6.",
    },
    {
      category: "Content",
      name: "Paragraph",
      icon: <Type className="w-5 h-5 text-cyan-500" />,
      component: <Paragraph />,
      description: "Formatted paragraph text with styling options.",
    },
    {
      category: "Content",
      name: "Text Block",
      icon: <Type className="w-5 h-5 text-blue-500" />,
      component: <TextBlock />,
      description: "Simple text section with title and description.",
    },
    {
      category: "Content",
      name: "Image",
      icon: <ImageIcon className="w-5 h-5 text-rose-500" />,
      component: <Image alt="Image component preview" />,
      description: "Responsive image with caption support.",
    },
    {
      category: "Content",
      name: "Video",
      icon: <VideoIcon className="w-5 h-5 text-red-500" />,
      component: <Video />,
      description: "Embed YouTube or Vimeo content.",
    },
    {
      category: "Content",
      name: "Gallery",
      icon: <ImageIcon className="w-5 h-5 text-fuchsia-500" />,
      component: <Gallery />,
      description: "Showcase multiple visuals in a gallery block.",
    },
    {
      category: "Content",
      name: "Testimonial",
      icon: <Type className="w-5 h-5 text-indigo-500" />,
      component: <Testimonial />,
      description: "Highlight student or parent feedback.",
    },
    {
      category: "Content",
      name: "Timeline",
      icon: <Type className="w-5 h-5 text-green-600" />,
      component: <Timeline />,
      description: "Ordered timeline with key dates.",
    },
    {
      category: "Content",
      name: "Badge",
      icon: <Type className="w-5 h-5 text-amber-600" />,
      component: <Badge />,
      description: "Compact highlight label for achievements.",
    },
    {
      category: "Content",
      name: "Quote",
      icon: <Type className="w-5 h-5 text-violet-600" />,
      component: <Quote />,
      description: "Stylized quotation component.",
    },
    {
      category: "Navigation",
      name: "Navbar",
      icon: <Layout className="w-5 h-5 text-zinc-600" />,
      component: <Navbar />,
      description: "Top navigation bar for page links.",
    },
    {
      category: "Navigation",
      name: "Footer",
      icon: <Layout className="w-5 h-5 text-zinc-500" />,
      component: <Footer />,
      description: "Footer area with institution details.",
    },
    {
      category: "Navigation",
      name: "Breadcrumb",
      icon: <Type className="w-5 h-5 text-slate-500" />,
      component: <Breadcrumb />,
      description: "Path trail navigation component.",
    },
    {
      category: "Navigation",
      name: "Pagination",
      icon: <Type className="w-5 h-5 text-slate-400" />,
      component: <Pagination />,
      description: "Page switcher controls for lists.",
    },
    {
      category: "Institution",
      name: "About Section",
      icon: <Info className="w-5 h-5 text-orange-500" />,
      component: <AboutSection />,
      description: "About us section with image and text.",
    },
    {
      category: "Institution",
      name: "Statistics",
      icon: <Layout className="w-5 h-5 text-indigo-500" />,
      component: <Statistics />,
      description: "Display institution numbers and achievements.",
    },
    {
      category: "Institution",
      name: "Faculty Grid",
      icon: <Users className="w-5 h-5 text-rose-500" />,
      component: <FacultyGrid />,
      description: "Display faculty members in a grid.",
    },
    {
      category: "Institution",
      name: "Department Card",
      icon: <Info className="w-5 h-5 text-cyan-600" />,
      component: <DepartmentCard />,
      description: "Department profile card with summary.",
    },
    {
      category: "Institution",
      name: "Grid Section",
      icon: <Layout className="w-5 h-5 text-blue-600" />,
      component: <GridSection />,
      description: "Fast card-grid section for highlights and links.",
    },
    {
      category: "Institution",
      name: "Faculty Profile",
      icon: <Users className="w-5 h-5 text-purple-500" />,
      component: <FacultyProfile />,
      description: "Individual faculty profile block.",
    },
    {
      category: "Institution",
      name: "Course List",
      icon: <Layout className="w-5 h-5 text-blue-500" />,
      component: <CourseList />,
      description: "Course offerings list component.",
    },
    {
      category: "Institution",
      name: "Event Calendar",
      icon: <Layout className="w-5 h-5 text-emerald-500" />,
      component: <EventCalendar />,
      description: "Upcoming events and dates panel.",
    },
    {
      category: "Institution",
      name: "Admission Form",
      icon: <Mail className="w-5 h-5 text-orange-500" />,
      component: <AdmissionForm />,
      description: "Admission entry form block.",
    },
    {
      category: "Institution",
      name: "Announcement Banner",
      icon: <Info className="w-5 h-5 text-amber-500" />,
      component: <AnnouncementBanner />,
      description: "Urgent or key campus announcement strip.",
    },
    {
      category: "Institution",
      name: "Placement Stats",
      icon: <Layout className="w-5 h-5 text-lime-600" />,
      component: <PlacementStats />,
      description: "Placement outcomes and package stats.",
    },
    {
      category: "Institution",
      name: "Progress Tracker",
      icon: <Layout className="w-5 h-5 text-indigo-600" />,
      component: <ProgressTracker />,
      description: "Multi-step progress state for applications.",
    },
    {
      category: "Institution",
      name: "Scholarship Card",
      icon: <Info className="w-5 h-5 text-indigo-500" />,
      component: <ScholarshipCard />,
      description: "Scholarship details and eligibility summary.",
    },
    {
      category: "Institution",
      name: "Exam Schedule",
      icon: <Layout className="w-5 h-5 text-pink-500" />,
      component: <ExamSchedule />,
      description: "Examination calendar with important dates.",
    },
    {
      category: "Institution",
      name: "Student Testimonial",
      icon: <Users className="w-5 h-5 text-sky-500" />,
      component: <StudentTestimonial />,
      description: "Student-specific testimonial presentation.",
    },
    {
      category: "Institution",
      name: "Facility Card",
      icon: <Info className="w-5 h-5 text-teal-500" />,
      component: <FacilityCard />,
      description: "Campus facility highlight card.",
    },
    {
      category: "Institution",
      name: "Club Card",
      icon: <Users className="w-5 h-5 text-green-500" />,
      component: <ClubCard />,
      description: "Student club information and highlights.",
    },
    {
      category: "Interactive",
      name: "FAQ Accordion",
      icon: <HelpCircle className="w-5 h-5 text-amber-500" />,
      component: <FAQAccordion />,
      description: "Expandable list of questions and answers.",
    },
    {
      category: "Interactive",
      name: "Tabs",
      icon: <Layout className="w-5 h-5 text-blue-500" />,
      component: <Tabs />,
      description: "Switchable tabbed content area.",
    },
    {
      category: "Interactive",
      name: "Modal",
      icon: <Layout className="w-5 h-5 text-violet-500" />,
      component: <Modal />,
      description: "Click-triggered modal preview component.",
    },
    {
      category: "Interactive",
      name: "Tooltip",
      icon: <HelpCircle className="w-5 h-5 text-slate-500" />,
      component: <Tooltip />,
      description: "Inline hover hint with tooltip text.",
    },
    {
      category: "Forms",
      name: "Contact Form",
      icon: <Mail className="w-5 h-5 text-cyan-500" />,
      component: <ContactForm />,
      description: "Contact section with details and a form.",
    },
    {
      category: "Forms",
      name: "Inquiry Form",
      icon: <Mail className="w-5 h-5 text-orange-500" />,
      component: <InquiryForm />,
      description: "Quick inquiry form scaffold.",
    },
    {
      category: "Forms",
      name: "Feedback Form",
      icon: <Mail className="w-5 h-5 text-red-500" />,
      component: <FeedbackForm />,
      description: "Feedback capture form scaffold.",
    },
    {
      category: "Actions",
      name: "Button",
      icon: <MousePointer2 className="w-5 h-5 text-indigo-500" />,
      component: <Button />,
      description: "A customizable call-to-action button.",
    },
    {
      category: "Actions",
      name: "Action Button",
      icon: <MousePointer2 className="w-5 h-5 text-violet-500" />,
      component: <ActionButton />,
      description:
        "Advanced button with solid/outline variants and positioning.",
    },
    {
      category: "Advanced",
      name: "Custom HTML",
      icon: <Code className="w-5 h-5 text-emerald-500" />,
      component: <RawHTML />,
      description: "Embed custom HTML and Tailwind classes.",
    },
    {
      category: "Advanced",
      name: "Alert Banner",
      icon: <Info className="w-5 h-5 text-red-500" />,
      component: <AlertBanner />,
      description: "Reusable alert or notice banner.",
    },
  ];

  const filteredComponents = components.filter((item) => {
    const haystack =
      `${item.category} ${item.name} ${item.description}`.toLowerCase();
    return haystack.includes(search.trim().toLowerCase());
  });

  const groupedComponents = filteredComponents.reduce<
    Record<string, typeof components>
  >((groups, item) => {
    if (!groups[item.category]) {
      groups[item.category] = [];
    }
    groups[item.category].push(item);
    return groups;
  }, {});

  return (
    <div className="w-72 border-r bg-white h-full shrink-0 overflow-y-auto p-4 scrollbar-hide">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
          <Layout className="w-3.5 h-3.5" />
          Components
        </h3>
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          {filteredComponents.length} items
        </span>
      </div>

      <div className="relative mb-4">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search components"
          className="w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
        />
      </div>

      <div className="space-y-5">
        {Object.entries(groupedComponents).map(([category, items]) => (
          <div key={category} className="space-y-3">
            <div className="flex items-center gap-2 sticky top-0 bg-white py-1">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                {category}
              </span>
              <span className="h-px flex-1 bg-gray-100" />
            </div>
            {items.map((item, index) => (
              <div
                key={`${category}-${index}`}
                ref={(ref: HTMLDivElement | null) => {
                  if (ref) {
                    connectors.create(ref, item.component);
                  }
                }}
                className="group p-3 border rounded-xl hover:border-blue-300 hover:bg-blue-50 cursor-grab transition active:cursor-grabbing shadow-sm"
              >
                <div className="flex items-center gap-3 mb-1">
                  <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-white transition">
                    {item.icon}
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    {item.name}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed px-1">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        ))}

        {filteredComponents.length === 0 && (
          <div className="py-12 text-center border border-dashed rounded-2xl bg-gray-50">
            <p className="text-sm font-semibold text-gray-600">
              No components found
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Try a different search term.
            </p>
          </div>
        )}

        {customComponents.length > 0 && (
          <>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-8 mb-4 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              AI Generated
            </h3>
            {customComponents.map((item, index) => (
              <div
                key={`custom-${index}`}
                ref={(ref: HTMLDivElement | null) => {
                  if (ref) {
                    // Case-insensitive lookup
                    const typeKey = Object.keys(ComponentMapper).find(
                      (k) => k.toLowerCase() === item.type.toLowerCase(),
                    );
                    const Component = typeKey
                      ? ComponentMapper[typeKey]
                      : TextBlock;
                    connectors.create(ref, <Component {...item.props} />);
                  }
                }}
                className="group p-3 border border-amber-100 bg-amber-50/30 rounded-xl hover:border-amber-300 hover:bg-amber-50 cursor-grab transition active:cursor-grabbing shadow-sm"
              >
                <div className="flex items-center gap-3 mb-1">
                  <div className="p-2 bg-white rounded-lg shadow-xs">
                    <Code className="w-5 h-5 text-amber-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    {item.name}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed px-1">
                  {item.description}
                </p>
              </div>
            ))}
          </>
        )}
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
        <h4 className="text-xs font-bold text-blue-700 mb-1 flex items-center gap-1">
          <Plus className="w-3 h-3" /> Tip
        </h4>
        <p className="text-[10px] text-blue-600 leading-relaxed">
          Drag and drop components directly onto the canvas or into containers.
        </p>
      </div>
    </div>
  );
};
