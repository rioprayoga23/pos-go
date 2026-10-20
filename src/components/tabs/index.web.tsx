import {
  Children,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type KeyboardEvent,
} from "react";
import { useWindowDimensions } from "react-native";
import { colors, spacing } from "../../theme";
import { Root, useTabs, type TriggerProps } from "./context";

type TabList = { fill: boolean; buttons: Map<string, HTMLButtonElement> };
const ListContext = createContext<TabList | null>(null);
function List({ children, label }: { children: ReactNode; label: string }) {
  const { width } = useWindowDimensions();
  const [buttons] = useState(() => new Map<string, HTMLButtonElement>());
  return (
    <ListContext
      value={{ fill: width < 768 && Children.count(children) <= 2, buttons }}
    >
      <div
        role="tablist"
        aria-label={label}
        style={{
          display: "flex",
          overflowX: "auto",
          borderBottom: `1px solid ${colors.line}`,
          flexShrink: 0,
        }}
      >
        {children}
      </div>
    </ListContext>
  );
}
function Trigger({ value, children, disabled }: TriggerProps) {
  const tabs = useTabs();
  const list = useContext(ListContext);
  const ref = useRef<HTMLButtonElement>(null);
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const selected = tabs.value === value;
  const buttons = list?.buttons;
  useEffect(() => {
    if (ref.current) buttons?.set(value, ref.current);
    return () => {
      buttons?.delete(value);
    };
  }, [buttons, value]);
  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const nodes = [...(buttons?.values() ?? [])].filter(
      (node) => !node.disabled,
    );
    const index = nodes.indexOf(event.currentTarget);
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? nodes.length - 1
          : (index + (event.key === "ArrowRight" ? 1 : -1) + nodes.length) %
            nodes.length;
    nodes[next]?.focus();
    nodes[next]?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }
  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      id={`${tabs.id}-tab-${value}`}
      aria-controls={`${tabs.id}-panel-${value}`}
      aria-selected={selected}
      tabIndex={selected ? 0 : -1}
      disabled={disabled}
      onClick={() => tabs.onValueChange(value)}
      onKeyDown={onKeyDown}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flexGrow: list?.fill ? 1 : 0,
        flexBasis: list?.fill ? 0 : "auto",
        flexShrink: 0,
        whiteSpace: "nowrap",
        minHeight: 48,
        padding: `0 ${spacing.xl}px`,
        borderTopWidth: 0,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        borderBottomWidth: 2,
        borderBottomStyle: "solid",
        borderBottomColor: selected ? colors.primary : "transparent",
        background: hovered ? colors.surfaceContainerLow : "transparent",
        color: selected ? colors.primaryDark : colors.inkMuted,
        fontFamily: "Inter_600SemiBold, Inter, sans-serif",
        fontSize: 14,
        fontWeight: 600,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.5 : 1,
        outline: focused ? `2px solid ${colors.primary}` : "none",
        outlineOffset: -3,
      }}
    >
      {children}
    </button>
  );
}
function Content({ value, children }: { value: string; children: ReactNode }) {
  const tabs = useTabs();
  return (
    <div
      role="tabpanel"
      id={`${tabs.id}-panel-${value}`}
      aria-labelledby={`${tabs.id}-tab-${value}`}
      hidden={tabs.value !== value}
      tabIndex={0}
      style={{ paddingTop: spacing.lg, minWidth: 0 }}
    >
      {tabs.value === value ? children : null}
    </div>
  );
}
export const Tabs = { Root, List, Trigger, Content };
