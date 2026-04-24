"use client";

import React, { useState } from "react";
import { useEditor } from "@craftjs/core";
import {
  Bot,
  Send,
  X,
  Minus,
  Sparkles,
  MessageSquare,
  FileCode,
  Layers,
  Wand2,
  History,
  Lightbulb,
  ShieldCheck,
} from "lucide-react";
import * as aiApi from "@/lib/api/ai.api";
import { toast } from "sonner";
import { ComponentMapper } from "./renderer/ComponentMapper";

export type ChatMode = "command" | "design" | "full";

type ChatMessage = {
  role: "user" | "ai";
  content: string;
  imageUrl?: string;
};

const isImageRequest = (text: string) =>
  /\b(image|picture|photo|poster|banner|illustration|render|photorealistic|cinematic|generate an image|create an image|create image|make an image)\b/i.test(
    text,
  );

const isComponentPlacementRequest = (text: string) =>
  /\b(add|insert|place|put|move|attach|drop)\b/i.test(text) &&
  /\b(component|form|button|section|card|banner|hero|footer|header|grid|faq|feedback|contact|image|text|paragraph|textblock|spacer|space|blank|gap|whitespace)\b/i.test(
    text,
  );

const shouldForceEmptyTextComponent = (message: string, type: unknown) => {
  const normalizedMessage = message.toLowerCase();
  const normalizedType = String(type || "").toLowerCase();
  const isTextType =
    normalizedType.includes("text") || normalizedType.includes("paragraph");

  if (!isTextType) {
    return false;
  }

  const explicitBlankIntent =
    /\b(empty|blank|without|no\s+text|no\s+content|do\s*not\s+write|don't\s+write|only\s+component|component\s+only|only\s+add\s+text\s+component|text\s+component\s+only)\b/i.test(
      normalizedMessage,
    );

  if (explicitBlankIntent) {
    return true;
  }

  const explicitContentIntent =
    /\b(write|generate|create|compose|draft)\b/i.test(normalizedMessage) &&
    /\b(paragraph|article|copy|content|bio|description)\b/i.test(
      normalizedMessage,
    );

  if (explicitContentIntent) {
    return false;
  }

  return true;
};

const buildEmptyTextProps = (input: Record<string, any> = {}) => ({
  ...input,
  content: "",
  text: "",
  title: "",
  subtitle: "",
  description: "",
  body: "",
  html: "",
});

const isElementLikeObject = (value: unknown): value is Record<string, any> =>
  Boolean(
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    "type" in (value as Record<string, any>) &&
    "props" in (value as Record<string, any>),
  );

const extractRenderableText = (value: unknown): string => {
  if (value == null) return "";
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => extractRenderableText(item))
      .join(" ")
      .trim();
  }

  if (isElementLikeObject(value)) {
    return extractRenderableText(value.props?.children);
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const preferredKeys = [
      "text",
      "content",
      "description",
      "title",
      "label",
      "children",
    ];

    for (const key of preferredKeys) {
      if (key in record) {
        const text = extractRenderableText(record[key]);
        if (text) return text;
      }
    }
  }

  return "";
};

const sanitizeAiComponentProps = (input: Record<string, any> = {}) => {
  const sanitized: Record<string, any> = { ...input };

  for (const [key, value] of Object.entries(sanitized)) {
    if (isElementLikeObject(value)) {
      sanitized[key] = extractRenderableText(value);
      continue;
    }

    if (key === "children") {
      if (Array.isArray(value)) {
        sanitized[key] = value.map((item) => {
          if (isElementLikeObject(item)) {
            return extractRenderableText(item);
          }
          return item;
        });
      } else if (value && typeof value === "object") {
        sanitized[key] = extractRenderableText(value);
      }
    }
  }

  return sanitized;
};

const formatValidationDetails = (details: unknown): string => {
  if (Array.isArray(details)) {
    return details
      .map((item) => {
        if (!item || typeof item !== "object") return String(item);
        const record = item as Record<string, unknown>;
        const field = String(record.field || record.param || "field");
        const message = String(
          record.message || record.msg || record.detail || "Invalid value",
        );
        return `${field}: ${message}`;
      })
      .join(", ");
  }

  if (typeof details === "string") {
    return details;
  }

  if (details && typeof details === "object") {
    try {
      return JSON.stringify(details);
    } catch {
      return "Validation error";
    }
  }

  return "Validation error";
};

export const AIChat = ({
  onFullBuild,
  onModeChange,
}: {
  onFullBuild?: (prompt: string) => void;
  onModeChange?: (mode: ChatMode) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [mode, setMode] = useState<ChatMode>("command");
  const [activeThreadId, setActiveThreadId] = useState<string | undefined>(
    undefined,
  );
  const [history, setHistory] = useState<
    { threadId: string; title: string; updatedAt: string }[]
  >([]);
  const [currentThreadTitle, setCurrentThreadTitle] = useState<string | null>(
    null,
  );
  const [selectedModel, setSelectedModel] = useState<string>(
    "claude-3-5-sonnet-20241022",
  );
  const [suggestions, setSuggestions] = useState<
    {
      id: string;
      title: string;
      impact: "high" | "medium" | "low";
      operation: Record<string, any>;
    }[]
  >([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [openingThreadId, setOpeningThreadId] = useState<string | null>(null);
  const [complianceScore, setComplianceScore] = useState<number | null>(null);
  const { actions, query, selectedCanvasId, selectedNodeId, selectedNodeType } =
    useEditor((state) => {
      const [currentSelectedId] = state.events.selected;
      const selectedNode = currentSelectedId
        ? state.nodes[currentSelectedId]
        : null;

      return {
        selectedCanvasId:
          selectedNode?.data.isCanvas && currentSelectedId
            ? currentSelectedId
            : undefined,
        selectedNodeId:
          currentSelectedId && currentSelectedId !== "ROOT"
            ? currentSelectedId
            : undefined,
        selectedNodeType:
          (selectedNode?.data?.type as { resolvedName?: string } | undefined)
            ?.resolvedName ||
          selectedNode?.data?.displayName ||
          undefined,
      };
    });

  const findFirstCanvasNodeId = (nodeId: string): string | undefined => {
    try {
      const node = query.node(nodeId).get() as Record<string, any> | null;
      if (!node) {
        return undefined;
      }

      if (node.data?.isCanvas) {
        return nodeId;
      }

      const childIds = Array.isArray(node.data?.nodes) ? node.data.nodes : [];
      for (const childId of childIds) {
        const found = findFirstCanvasNodeId(String(childId));
        if (found) {
          return found;
        }
      }
    } catch {
      return undefined;
    }

    return undefined;
  };

  const getInsertionTargetId = () => {
    if (selectedCanvasId) {
      return selectedCanvasId;
    }

    try {
      if (query.node("ROOT").isCanvas()) {
        return "ROOT";
      }
    } catch {
      // Continue to fallback lookup.
    }

    try {
      const rootNode = query.node("ROOT").get() as Record<string, any> | null;
      const rootChildren = Array.isArray(rootNode?.data?.nodes)
        ? rootNode.data.nodes
        : [];

      for (const childId of rootChildren) {
        const found = findFirstCanvasNodeId(String(childId));
        if (found) {
          return found;
        }
      }
    } catch {
      // Fall through to ROOT.
    }

    return "ROOT";
  };

  const addComponentToCanvas = (
    Component: React.ComponentType<Record<string, unknown>>,
    props: Record<string, any>,
    position?: "append" | "prepend" | number | string,
  ) => {
    const element = React.createElement(Component, props);
    const primaryTargetId = getInsertionTargetId();
    const primaryIndex = resolveInsertionIndex(primaryTargetId, position);

    try {
      actions.add(query.createNode(element), primaryTargetId, primaryIndex);
      return { ok: true as const, targetId: primaryTargetId };
    } catch (primaryError) {
      try {
        const fallbackIndex = resolveInsertionIndex("ROOT", "append");
        actions.add(query.createNode(element), "ROOT", fallbackIndex);
        return {
          ok: true as const,
          targetId: "ROOT",
          fallback: true as const,
          primaryError,
        };
      } catch (fallbackError) {
        return {
          ok: false as const,
          targetId: primaryTargetId,
          primaryError,
          fallbackError,
        };
      }
    }
  };

  const resolveInsertionIndex = (
    targetId: string,
    position: "append" | "prepend" | number | string | undefined,
  ): number | undefined => {
    try {
      const targetNode = query.node(targetId).get() as Record<string, any>;
      const childCount = Array.isArray(targetNode?.data?.nodes)
        ? targetNode.data.nodes.length
        : 0;

      if (position === "prepend") {
        return 0;
      }

      if (position === "append" || position == null) {
        return childCount;
      }

      const maybeNumber = Number(position);
      if (Number.isFinite(maybeNumber)) {
        return Math.max(0, Math.min(childCount, Math.floor(maybeNumber)));
      }
    } catch {
      return undefined;
    }

    return undefined;
  };

  const craftToPageJSON = () => {
    try {
      const serialized = JSON.parse(query.serialize()) as Record<string, any>;
      const components = Object.entries(serialized)
        .filter(([id]) => id !== "ROOT")
        .map(([, node]) => ({
          type: node?.type?.resolvedName || "Container",
          props: node?.props || {},
        }));
      return {
        components,
        meta: {},
      };
    } catch {
      return { components: [], meta: {} };
    }
  };

  const getEditorNodes = () => {
    try {
      const serialized = JSON.parse(query.serialize()) as Record<string, any>;
      return Object.entries(serialized)
        .filter(([id]) => id !== "ROOT")
        .map(([id, node]) => ({
          id,
          type: String(node?.type?.resolvedName || node?.displayName || ""),
          props: (node?.props || {}) as Record<string, any>,
        }));
    } catch {
      return [] as Array<{
        id: string;
        type: string;
        props: Record<string, any>;
      }>;
    }
  };

  const resolveTargetNodeId = (
    target?: Record<string, any>,
    preferredType?: string,
  ) => {
    const targetId = String(target?.id || "").trim();
    if (targetId) {
      try {
        query.node(targetId).get();
        return targetId;
      } catch {
        // Ignore and continue fallback lookup.
      }
    }

    if (selectedNodeId) {
      return selectedNodeId;
    }

    const nodes = getEditorNodes();
    const normalizedType = String(
      preferredType || target?.type || target?.componentType || "",
    )
      .trim()
      .toLowerCase();

    if (normalizedType) {
      const typed = [...nodes].reverse().find((node) => {
        const nodeType = node.type.toLowerCase();
        return (
          nodeType === normalizedType ||
          nodeType.includes(normalizedType) ||
          normalizedType.includes(nodeType)
        );
      });
      if (typed) return typed.id;
    }

    return nodes.length ? nodes[nodes.length - 1].id : undefined;
  };

  const normalizeUpdateProps = (input: Record<string, any> = {}) => {
    const normalized: Record<string, any> = { ...input };
    const primaryText = [
      normalized.text,
      normalized.content,
      normalized.description,
      normalized.body,
      normalized.title,
      normalized.subtitle,
    ].find((value) => typeof value === "string" && value.trim().length > 0);

    if (typeof primaryText === "string") {
      for (const key of [
        "text",
        "content",
        "description",
        "body",
        "title",
        "subtitle",
      ]) {
        if (!(key in normalized)) {
          normalized[key] = primaryText;
        }
      }
    }

    return normalized;
  };

  const buildCompactCommandContext = () => {
    try {
      const serialized = JSON.parse(query.serialize()) as Record<string, any>;
      const entries = Object.entries(serialized).filter(
        ([id]) => id !== "ROOT",
      );

      const componentCounts: Record<string, number> = {};
      const componentPreview = entries.slice(0, 20).map(([id, node]) => {
        const type = node?.type?.resolvedName || "Unknown";
        componentCounts[type] = (componentCounts[type] || 0) + 1;
        return {
          id,
          type,
          previewText: [
            node?.props?.title,
            node?.props?.subtitle,
            node?.props?.description,
          ]
            .filter((value) => typeof value === "string" && value.trim())
            .join(" | ")
            .slice(0, 120),
        };
      });

      return {
        nodeCount: entries.length,
        componentCounts,
        componentPreview,
        truncated: entries.length > 20,
      };
    } catch {
      return {};
    }
  };

  const loadConversationHistory = async () => {
    try {
      const response = await aiApi.getConversationHistory();
      const conversations = response?.data?.conversations || [];
      setHistory(conversations);
    } catch {
      setHistory([]);
    }
  };

  const openConversationThread = async (threadId: string) => {
    try {
      setOpeningThreadId(threadId);
      const response = await aiApi.getConversationThread(threadId);
      const data = response?.data;
      const exchanges = data?.exchanges || [];
      const matchedHistoryItem = history.find(
        (item) => item.threadId === threadId,
      );

      setMessages(
        exchanges.map(
          (exchange: { role: "user" | "assistant"; message: string }) => ({
            role: exchange.role === "assistant" ? "ai" : "user",
            content: exchange.message,
          }),
        ),
      );
      setActiveThreadId(threadId);
      setCurrentThreadTitle(
        String(
          data?.title || matchedHistoryItem?.title || "Conversation",
        ).trim(),
      );
      setShowHistory(false);
      toast.success("Previous conversation loaded");
    } catch {
      toast.error("Could not open this conversation");
    } finally {
      setOpeningThreadId(null);
    }
  };

  const startNewChat = () => {
    setActiveThreadId(undefined);
    setCurrentThreadTitle(null);
    setMessages([]);
    setPrompt("");
    setShowHistory(true);
    toast.success("Started a new chat");
  };

  const loadSuggestions = async () => {
    setIsLoadingSuggestions(true);
    try {
      const response = await aiApi.getLiveSuggestions(craftToPageJSON());
      setSuggestions(response?.data?.suggestions || []);
      if (!response?.data?.suggestions?.length) {
        toast.success("No critical suggestions right now. Great structure!");
      }
    } catch {
      toast.error("Failed to load live suggestions");
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const applySuggestion = async (operation: Record<string, any>) => {
    if (operation.op === "add-component" && operation.component) {
      const type = operation.component.type as string;
      const props = operation.component.props || {};
      const typeKey = Object.keys(ComponentMapper).find(
        (k) => k.toLowerCase() === type.toLowerCase(),
      );
      const Component = typeKey ? ComponentMapper[typeKey] : null;

      if (Component) {
        const targetId = getInsertionTargetId();
        const safeProps = sanitizeAiComponentProps(props || {});
        actions.add(
          query.createNode(React.createElement(Component, safeProps)),
          targetId,
        );
        toast.success("Suggestion applied");
        return;
      }
    }

    if (operation.op === "set-meta") {
      toast.success(
        "Meta suggestion noted. Apply this in page metadata settings.",
      );
      return;
    }

    try {
      const response = await aiApi.applySuggestion(
        craftToPageJSON(),
        operation,
      );
      if (response?.success) {
        toast.success("Suggestion processed");
      } else {
        toast.error("Failed to apply suggestion");
      }
    } catch {
      toast.error("Failed to apply suggestion");
    }
  };

  const runComplianceCheck = async () => {
    try {
      const response = await aiApi.validateCompliance(craftToPageJSON());
      const score = response?.data?.score;
      setComplianceScore(typeof score === "number" ? score : null);
      if (typeof score === "number") {
        toast.success(`Compliance score: ${score}%`);
      }
    } catch {
      toast.error("Failed to run compliance validation");
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      void loadConversationHistory();
    }
  }, [isOpen]);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (isOpen && !isMinimized) {
          setIsMinimized(true);
        } else if (isOpen && isMinimized) {
          setIsOpen(false);
          setIsMinimized(false);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, isMinimized]);

  const handleModeChange = (newMode: ChatMode) => {
    setMode(newMode);
    onModeChange?.(newMode);
  };

  const runCommandFlow = async (userMessage: string, memoryData?: any) => {
    const response = await aiApi.processCommand(
      userMessage,
      buildCompactCommandContext(),
      selectedModel,
    );

    if (!response.success || !response.data) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: memoryData?.reply
            ? `${memoryData.reply}\n\n${response.error || "Sorry, I couldn't process that request."}`
            : response.error || "Sorry, I couldn't process that request.",
        },
      ]);
      return;
    }

    const operation = response.data;
    console.log("AI Operation received:", operation);

    if (operation.action === "generate_full_html") {
      console.log(
        "Action is generate_full_html, onFullBuild is:",
        !!onFullBuild,
      );
      if (onFullBuild) {
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            content: memoryData?.reply
              ? `${memoryData.reply}\n\nYou requested a full page. I am generating the complete layout now and showing it in the visual editor...`
              : "You requested a full page. I am generating the complete layout now and showing it in the visual editor...",
          },
        ]);
        handleModeChange("full");
        onFullBuild(operation.prompt || userMessage);
        return;
      }
      console.error("onFullBuild callback is missing!");
    }

    if (
      operation.action === "insert" ||
      operation.action === "update" ||
      operation.action === "delete"
    ) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "Updating your design now..." },
      ]);
    }

    if (operation.action === "update") {
      const targetId = resolveTargetNodeId(
        operation.target,
        operation.component?.type || selectedNodeType,
      );
      if (!targetId) {
        toast.error("No component found to update.");
        return;
      }

      const rawProps =
        operation.component?.props ||
        operation.props ||
        operation.target?.props;
      const safeProps = sanitizeAiComponentProps(
        normalizeUpdateProps(rawProps),
      );

      if (!Object.keys(safeProps).length) {
        toast.error("No valid properties were returned for update.");
        return;
      }

      actions.setProp(targetId, (props: Record<string, any>) => {
        Object.assign(props, safeProps);
      });
      toast.success("Component updated");
      return;
    }

    if (operation.action === "delete") {
      const targetId = resolveTargetNodeId(
        operation.target,
        operation.component?.type || selectedNodeType,
      );
      if (!targetId || targetId === "ROOT") {
        toast.error("No component found to delete.");
        return;
      }

      actions.delete(targetId);
      toast.success("Component deleted");
      return;
    }

    if (operation.action === "move") {
      const targetId = resolveTargetNodeId(
        operation.target,
        operation.component?.type || selectedNodeType,
      );
      if (!targetId || targetId === "ROOT") {
        toast.error("No component found to move.");
        return;
      }

      try {
        const node = query.node(targetId).get() as Record<string, any>;
        const parentId = String(node?.data?.parent || "ROOT");
        const parentNode = query.node(parentId).get() as Record<string, any>;
        const siblingIds = Array.isArray(parentNode?.data?.nodes)
          ? parentNode.data.nodes
          : [];

        const requestedPosition = String(
          operation.position ||
            operation.component?.position ||
            operation.to?.position ||
            operation.target?.position ||
            "append",
        ).toLowerCase();

        let nextIndex = siblingIds.length - 1;
        if (/prepend|top|start|first/.test(requestedPosition)) {
          nextIndex = 0;
        } else if (/append|bottom|end|last/.test(requestedPosition)) {
          nextIndex = Math.max(0, siblingIds.length - 1);
        } else {
          const parsed = Number(requestedPosition);
          if (Number.isFinite(parsed)) {
            nextIndex = Math.max(
              0,
              Math.min(siblingIds.length - 1, Math.floor(parsed)),
            );
          }
        }

        actions.move(targetId, parentId, nextIndex);
        toast.success("Component moved");
      } catch (error) {
        console.error("Failed to move component", error);
        toast.error("Could not move component.");
      }
      return;
    }

    if (operation.action === "insert" && operation.component) {
      const { type, props, position } = operation.component;
      const finalProps = shouldForceEmptyTextComponent(userMessage, type)
        ? buildEmptyTextProps(props || {})
        : normalizeUpdateProps({ ...(props || {}) });

      const typeKey = Object.keys(ComponentMapper).find(
        (k) => k.toLowerCase() === String(type).toLowerCase(),
      );
      const Component = typeKey ? ComponentMapper[typeKey] : null;

      if (Component) {
        const safeProps = sanitizeAiComponentProps(finalProps);
        const addResult = addComponentToCanvas(Component, safeProps, position);

        if (addResult.ok) {
          toast.success(
            addResult.fallback
              ? `Added ${type} component (fallback canvas)`
              : `Added ${type} component!`,
          );
          if (addResult.fallback) {
            console.warn(
              "Primary canvas insert failed; inserted into ROOT instead.",
              addResult.primaryError,
            );
          }
        } else {
          console.error("Failed to add AI component", {
            targetId: addResult.targetId,
            primaryError: addResult.primaryError,
            fallbackError: addResult.fallbackError,
          });
          toast.error(`Could not add ${type}. Try selecting the main canvas.`);
        }
      } else if (
        String(type).toLowerCase().includes("template") ||
        String(type).toLowerCase().includes("page")
      ) {
        if (onFullBuild) {
          setMessages((prev) => [
            ...prev,
            {
              role: "ai",
              content: `I don't have a specific "${type}" component, but I can build a full page for you using that theme. Building your page now...`,
            },
          ]);
          onFullBuild(userMessage);
        }
      } else {
        console.warn(`Component type ${type} not found in mapper`);
        toast.error(`Unknown component type: ${type}`);
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            content: memoryData?.reply
              ? `${memoryData.reply}\n\nSorry, I don't know how to create a "${type}" component yet. Try asking for a HeroBanner or TextBlock.`
              : `Sorry, I don't know how to create a "${type}" component yet. Try asking for a HeroBanner or TextBlock.`,
          },
        ]);
      }
    }

    void loadConversationHistory();
  };

  const handleSend = async () => {
    if (!prompt.trim()) return;

    const userMessage = prompt.trim();
    setPrompt("");
    setIsTyping(true);

    const nextThreadId = activeThreadId;
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    if (isImageRequest(userMessage)) {
      try {
        const imageResponse = await aiApi.generateImage(userMessage);
        const imageData = imageResponse?.data ?? imageResponse;
        const imageUrl = imageData?.url || imageData?.imageUrl;

        if (imageUrl) {
          const ImageComponent = ComponentMapper.Image;
          if (ImageComponent) {
            const targetId = getInsertionTargetId();
            actions.add(
              query.createNode(
                React.createElement(ImageComponent, {
                  src: imageUrl,
                  alt: userMessage.slice(0, 120) || "Generated image",
                  caption: "AI generated image",
                  width: "100%",
                  height: "320px",
                  objectFit: "cover",
                }),
              ),
              targetId,
            );
          }

          setMessages((prev) => [
            ...prev,
            {
              role: "ai",
              content:
                imageData?.provider === "fallback"
                  ? "I could not reach an image model, so I generated a fallback preview image and inserted it into the editor."
                  : "Image generated successfully and inserted into the editor.",
              imageUrl,
            },
          ]);
          toast.success("Image generated and inserted");
          return;
        }

        throw new Error("No image URL returned");
      } catch (error: any) {
        console.error("Image generation error:", error);
        const responseData = error?.response?.data;
        let errorMessage =
          responseData?.error?.message ||
          error?.message ||
          "Failed to create image";

        const normalized = String(errorMessage).toLowerCase();
        if (
          normalized.includes("billing hard limit") ||
          normalized.includes("quota") ||
          responseData?.error?.code === "IMAGE_BILLING_LIMIT"
        ) {
          errorMessage =
            "Image generation is blocked by OpenAI billing/quota limit. Please add credits or increase your OpenAI budget, then retry.";
        }

        toast.error(errorMessage);
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            content: `Error: ${errorMessage}. Please try again.`,
          },
        ]);
        return;
      } finally {
        setIsTyping(false);
      }
    }

    try {
      const memoryResponse = await aiApi.chatWithMemory(
        userMessage,
        nextThreadId,
        selectedModel,
      );
      const memoryData = memoryResponse?.data;
      if (memoryData?.threadId) {
        setActiveThreadId(memoryData.threadId);
        if (!currentThreadTitle) {
          setCurrentThreadTitle(userMessage.slice(0, 60));
        }
      }

      if (mode === "full" && onFullBuild) {
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            content: memoryData?.reply
              ? `${memoryData.reply}\n\nArchitecting your full website now. I am compiling the page and placing it into the visual editor.`
              : "Architecting your full website now. I am compiling the page and placing it into the visual editor.",
          },
        ]);
        onFullBuild(userMessage);
        void loadConversationHistory();
        setIsTyping(false);
        return;
      }

      if (mode === "design") {
        if (isComponentPlacementRequest(userMessage)) {
          await runCommandFlow(userMessage, memoryData);
        } else {
          try {
            const response = await aiApi.generateComponent(
              userMessage,
              selectedModel,
            );
            if (response.success && response.data) {
              window.dispatchEvent(new CustomEvent("customComponentGenerated"));
              setMessages((prev) => [
                ...prev,
                {
                  role: "ai",
                  content: `${memoryData?.reply ? `${memoryData.reply}\n\n` : ""}I've created a new component: **${response.data.name}**. I've added it to the "AI Generated" section. You can now drag it onto the page!`,
                },
              ]);
              toast.success("New component generated!");
            } else {
              setMessages((prev) => [
                ...prev,
                {
                  role: "ai",
                  content: response.error || "Failed to generate component.",
                },
              ]);
            }
          } catch (error: any) {
            const responseData = error?.response?.data;
            const fallbackMessage =
              responseData?.error?.message ||
              error?.message ||
              "Failed to generate component.";

            if (
              error?.response?.status === 400 ||
              /jsxCode is required/i.test(fallbackMessage) ||
              /validation/i.test(fallbackMessage)
            ) {
              await runCommandFlow(userMessage, memoryData);
            } else {
              setMessages((prev) => [
                ...prev,
                {
                  role: "ai",
                  content: fallbackMessage,
                },
              ]);
              toast.error(fallbackMessage);
            }
          }
        }
      } else {
        await runCommandFlow(userMessage, memoryData);
      }
    } catch (error: any) {
      console.error("AI error:", error);
      const responseData = error.response?.data;
      let errorMessage =
        responseData?.error?.message || "Failed to connect to AI service";

      if (
        responseData?.error?.code === "VALIDATION_ERROR" &&
        responseData.error.details
      ) {
        const details = formatValidationDetails(responseData.error.details);
        errorMessage = `Validation error - ${details}`;
      }

      toast.error(errorMessage);
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: `Error: ${errorMessage}. Please try again.` },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleToggleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
  };

  const modeButtonClass = (targetMode: ChatMode) =>
    `px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
      mode === targetMode
        ? "bg-blue-600 text-white"
        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
    }`;

  return (
    <div className="fixed bottom-20 right-5 z-60 md:bottom-8 md:right-6">
      {isOpen ? (
        <div
          className={`bg-white rounded-2xl shadow-2xl w-90 md:w-96 overflow-hidden border border-gray-200 animate-in slide-in-from-bottom-5 duration-300 flex flex-col ${
            isMinimized ? "h-16" : "h-[72vh] max-h-180 min-h-105"
          }`}
        >
          <div className="bg-white px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white grid place-items-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  AI Design Assistant
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {isMinimized ? "Minimized" : "Chat open"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized((prev) => !prev)}
                className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition text-[11px] font-semibold text-slate-700 inline-flex items-center gap-1"
                title={isMinimized ? "Restore chat" : "Minimize chat"}
              >
                <Minus className="w-3.5 h-3.5" />
                {isMinimized ? "Restore" : "Minimize"}
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsMinimized(false);
                }}
                className="px-2 py-1.5 bg-slate-100 hover:bg-red-500/80 hover:text-white rounded-lg transition text-[11px] font-semibold text-slate-700 inline-flex items-center gap-1"
                title="Close chat"
              >
                <X className="w-3.5 h-3.5" />
                Close
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleModeChange("command")}
                    className={modeButtonClass("command")}
                  >
                    <span className="inline-flex items-center gap-1">
                      <Layers className="w-3 h-3" /> Blocks
                    </span>
                  </button>
                  <button
                    onClick={() => handleModeChange("design")}
                    className={modeButtonClass("design")}
                  >
                    <span className="inline-flex items-center gap-1">
                      <Wand2 className="w-3 h-3" /> Component
                    </span>
                  </button>
                  <button
                    onClick={() => handleModeChange("full")}
                    className={modeButtonClass("full")}
                  >
                    <span className="inline-flex items-center gap-1">
                      <FileCode className="w-3 h-3" /> Full Page
                    </span>
                  </button>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setShowHistory((prev) => !prev)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 inline-flex items-center gap-1"
                  >
                    <History className="w-3 h-3" />{" "}
                    {showHistory ? "Hide" : "Show"} History
                  </button>
                  <button
                    onClick={() => void loadSuggestions()}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 inline-flex items-center gap-1"
                    title="Generate live suggestions"
                  >
                    <Lightbulb className="w-3 h-3" /> Suggestions
                  </button>
                  <button
                    onClick={() => void runComplianceCheck()}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 inline-flex items-center gap-1"
                    title="Run compliance checks"
                  >
                    <ShieldCheck className="w-3 h-3" /> Compliance
                  </button>
                </div>
                <div className="flex items-center justify-between gap-2 rounded-lg bg-white border border-slate-200 px-2.5 py-1.5">
                  <p className="text-[11px] text-slate-600 truncate">
                    {activeThreadId
                      ? `Continuing: ${currentThreadTitle || "Previous conversation"}`
                      : "New conversation"}
                  </p>
                  {activeThreadId ? (
                    <button
                      onClick={startNewChat}
                      className="shrink-0 px-2 py-1 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200"
                    >
                      New Chat
                    </button>
                  ) : null}
                </div>
              </div>

              {activeThreadId ? (
                <div className="px-4 pb-2">
                  <button
                    onClick={startNewChat}
                    className="w-full rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Start New Chat Instead of Continuing This Thread
                  </button>
                </div>
              ) : null}

              <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {showHistory && (
                  <div className="bg-white border border-gray-200 rounded-xl p-3">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2">
                      Recent Conversations
                    </p>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {history.length === 0 ? (
                        <p className="text-xs text-gray-500">
                          No saved chats yet.
                        </p>
                      ) : (
                        history.slice(0, 8).map((item) => (
                          <button
                            key={item.threadId}
                            onClick={() =>
                              void openConversationThread(item.threadId)
                            }
                            disabled={openingThreadId === item.threadId}
                            className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition border ${
                              activeThreadId === item.threadId
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "hover:bg-gray-50 text-gray-700 border-gray-200"
                            }`}
                          >
                            <div className="font-semibold truncate">
                              {item.title}
                            </div>
                            {openingThreadId === item.threadId ? (
                              <div className="text-[10px] mt-1 text-blue-600">
                                Opening...
                              </div>
                            ) : null}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                    <div className="p-4 bg-blue-100 text-blue-600 rounded-full">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">
                        {mode === "command"
                          ? "Block Editor Mode"
                          : mode === "design"
                            ? "Component Architect Mode"
                            : "Full Page Build Mode"}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {mode === "command"
                          ? "Ask to change colors, add blocks, or edit content."
                          : mode === "design"
                            ? "Describe a new component to build from scratch."
                            : "Describe a complete page and AI will generate it."}
                      </p>
                    </div>
                  </div>
                )}

                {suggestions.length > 0 && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 space-y-2">
                    <p className="text-[10px] font-black text-amber-700 uppercase tracking-wider">
                      Live Suggestions
                    </p>
                    {suggestions.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-lg border border-amber-100 p-2.5"
                      >
                        <p className="text-xs font-semibold text-gray-700">
                          {item.title}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-700">
                            {item.impact} impact
                          </span>
                          <button
                            onClick={() => void applySuggestion(item.operation)}
                            className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {complianceScore !== null && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                    <p className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">
                      Compliance Score
                    </p>
                    <p className="text-lg font-black text-emerald-800">
                      {complianceScore}%
                    </p>
                  </div>
                )}

                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-xl text-sm whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-700 shadow-sm border border-gray-200"
                      }`}
                    >
                      {msg.content}
                      {msg.imageUrl ? (
                        <div className="mt-3 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                          <img
                            src={msg.imageUrl}
                            alt="AI generated"
                            className="block w-full max-w-full"
                          />
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 rounded-tl-none flex gap-1">
                      <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce delay-75"></span>
                      <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce delay-150"></span>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t bg-white">
                <div className="relative">
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Ask AI to design..."
                    className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 transition"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!prompt.trim() || isTyping}
                    className="absolute right-2 top-1.5 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                    title="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Model
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="text-[11px] bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700"
                    title="Select AI model"
                  >
                    <option value="llama-3.3-70b-versatile">
                      Llama 3.3 70B
                    </option>
                    <option value="claude-3-5-sonnet-20241022">
                      Claude 3.5 Sonnet
                    </option>
                    <option value="gpt-4o-mini">GPT-4o Mini</option>
                  </select>
                  {isLoadingSuggestions && (
                    <span className="text-[10px] text-gray-500 font-semibold">
                      Loading suggestions...
                    </span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <button
          onClick={handleToggleOpen}
          className="bg-blue-600 text-white p-3.5 rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2 group border border-blue-500/40"
          title="Open AI Assistant"
        >
          <div className="bg-white/20 p-1.5 rounded-full">
            <MessageSquare className="w-5 h-5" />
          </div>
          <span className="font-bold text-xs pr-1.5 tracking-wide uppercase">
            AI
          </span>
        </button>
      )}
    </div>
  );
};
