"use client";

import React from "react";
import { useNode } from "@craftjs/core";
import { Mail, Linkedin, Phone } from "lucide-react";

interface FacultyMember {
  key: string;
  name: string;
  role: string;
  department: string;
  image: string;
  email: string;
  phone: string;
  bio: string;
  profileUrl: string;
}

interface FacultyGridProps {
  title?: string;
  subtitle?: string;
  columns?: number;
  cardStyle?: "classic" | "minimal";
  showContact?: boolean;
  clickAction?: "disabled" | "navigate";
  membersData?: string;
}

const parseMembers = (raw?: string): FacultyMember[] => {
  return (raw || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, idx) => {
      const [name, role, department, image, email, phone, bio, profileUrl] =
        line.split("|");
      return {
        key: `${name || "faculty"}-${idx}`,
        name: (name || "").trim(),
        role: (role || "").trim(),
        department: (department || "").trim(),
        image: (image || "").trim(),
        email: (email || "").trim(),
        phone: (phone || "").trim(),
        bio: (bio || "").trim(),
        profileUrl: (profileUrl || "").trim(),
      };
    })
    .filter((member) => Boolean(member.name));
};

const serializeMembers = (members: FacultyMember[]): string =>
  members
    .map((member) =>
      [
        member.name,
        member.role,
        member.department,
        member.image,
        member.email,
        member.phone,
        member.bio,
        member.profileUrl,
      ].join("|"),
    )
    .join("\n");

export const FacultyGrid = ({
  title = "Our Expert Faculty",
  subtitle = "Faculty",
  columns = 3,
  cardStyle = "classic",
  showContact = true,
  clickAction = "disabled",
  membersData = "Dr. Sarah Johnson|Head of Department|Computer Science|https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300&h=300|sarah@college.edu|+91 98765 10001|Ph.D. in Computer Science with 15 years of experience.|/faculty/sarah-johnson\nProf. Michael Chen|Associate Professor|Artificial Intelligence|https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300&h=300|michael@college.edu|+91 98765 10002|Expert in AI and Machine Learning.|/faculty/michael-chen\nDr. Emily Brown|Assistant Professor|Data Science|https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=300&h=300|emily@college.edu|+91 98765 10003|Focuses on Data Structures and Algorithms.|/faculty/emily-brown",
}: FacultyGridProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  const members = parseMembers(membersData);
  const safeColumns = Math.min(4, Math.max(1, columns || 3));
  const columnClassMap: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  return (
    <div
      ref={(ref: HTMLDivElement | null) => {
        if (ref) connect(drag(ref));
      }}
      className="py-16 px-6 bg-white"
    >
      <div className="max-w-6xl mx-auto">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500 text-center mb-2">
          {subtitle}
        </p>
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
          {title}
        </h2>

        <div className={`grid gap-8 ${columnClassMap[safeColumns]}`}>
          {members.map((member) => {
            const card = (
              <div
                className={`h-full rounded-2xl border border-slate-100 p-5 ${
                  cardStyle === "classic"
                    ? "bg-white shadow-sm hover:shadow-md"
                    : "bg-slate-50"
                } transition-all`}
              >
                <div className="flex flex-col items-center text-center group">
                  <div className="relative w-28 h-28 mb-4 rounded-full overflow-hidden shadow border-4 border-white">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {member.name}
                  </h3>
                  <p className="text-blue-600 font-medium text-xs mt-1 uppercase tracking-wider">
                    {member.role}
                  </p>
                  {member.department && (
                    <p className="text-xs text-slate-500 mt-1">
                      {member.department}
                    </p>
                  )}
                  {member.bio && (
                    <p className="text-gray-600 text-sm mt-3 leading-relaxed">
                      {member.bio}
                    </p>
                  )}
                  {showContact && (
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                      {member.email && (
                        <span className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                          <Mail className="w-3.5 h-3.5" />
                          {member.email}
                        </span>
                      )}
                      {member.phone && (
                        <span className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                          <Phone className="w-3.5 h-3.5" />
                          {member.phone}
                        </span>
                      )}
                    </div>
                  )}
                  {member.profileUrl && (
                    <a
                      href={member.profileUrl}
                      onClick={(event) => {
                        if (clickAction !== "navigate") event.preventDefault();
                      }}
                      className="inline-flex items-center gap-1 text-xs mt-4 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <Linkedin className="w-3.5 h-3.5" />
                      View Profile
                    </a>
                  )}
                </div>
              </div>
            );

            return <div key={member.key}>{card}</div>;
          })}
        </div>
      </div>
    </div>
  );
};

export const FacultyGridSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as FacultyGridProps,
  }));

  const members = parseMembers(props.membersData);

  const updateMember = (
    index: number,
    field: keyof Omit<FacultyMember, "key">,
    value: string,
  ) => {
    setProp((p: FacultyGridProps) => {
      const current = parseMembers(p.membersData);
      if (!current[index]) return;
      const updated = current.map((member, idx) =>
        idx === index ? { ...member, [field]: value } : member,
      );
      p.membersData = serializeMembers(updated);
    });
  };

  const addMember = () => {
    setProp((p: FacultyGridProps) => {
      const current = parseMembers(p.membersData);
      current.push({
        key: `new-${Date.now()}`,
        name: "New Faculty",
        role: "Professor",
        department: "Department",
        image:
          "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=300&h=300",
        email: "faculty@college.edu",
        phone: "+91 90000 00000",
        bio: "Short faculty bio.",
        profileUrl: "/faculty/new-faculty",
      });
      p.membersData = serializeMembers(current);
    });
  };

  const removeMember = (index: number) => {
    setProp((p: FacultyGridProps) => {
      const current = parseMembers(p.membersData);
      p.membersData = serializeMembers(
        current.filter((_, idx) => idx !== index),
      );
    });
  };

  return (
    <div className="p-4 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          value={props.title || ""}
          onChange={(e) =>
            setProp((p: FacultyGridProps) => (p.title = e.target.value))
          }
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Subtitle</label>
        <input
          type="text"
          value={props.subtitle || ""}
          onChange={(e) =>
            setProp((p: FacultyGridProps) => (p.subtitle = e.target.value))
          }
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium mb-1">Columns</label>
          <select
            value={props.columns || 3}
            onChange={(e) =>
              setProp(
                (p: FacultyGridProps) =>
                  (p.columns = parseInt(e.target.value, 10)),
              )
            }
            className="w-full px-3 py-2 border rounded"
          >
            <option value={1}>1 Column</option>
            <option value={2}>2 Columns</option>
            <option value={3}>3 Columns</option>
            <option value={4}>4 Columns</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Card Style</label>
          <select
            value={props.cardStyle || "classic"}
            onChange={(e) =>
              setProp(
                (p: FacultyGridProps) =>
                  (p.cardStyle = e.target
                    .value as FacultyGridProps["cardStyle"]),
              )
            }
            className="w-full px-3 py-2 border rounded"
          >
            <option value="classic">Classic</option>
            <option value="minimal">Minimal</option>
          </select>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          id="faculty-show-contact"
          type="checkbox"
          checked={Boolean(props.showContact)}
          onChange={(e) =>
            setProp((p: FacultyGridProps) => (p.showContact = e.target.checked))
          }
          className="h-4 w-4"
        />
        <label htmlFor="faculty-show-contact" className="text-sm text-gray-700">
          Show Contact Chips
        </label>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Click Behavior</label>
        <select
          value={props.clickAction || "disabled"}
          onChange={(e) =>
            setProp(
              (p: FacultyGridProps) =>
                (p.clickAction = e.target
                  .value as FacultyGridProps["clickAction"]),
            )
          }
          className="w-full px-3 py-2 border rounded"
        >
          <option value="disabled">Display Only</option>
          <option value="navigate">Navigate on Profile Click</option>
        </select>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium">Faculty Members</label>
          <button
            type="button"
            onClick={addMember}
            className="px-2.5 py-1.5 rounded bg-blue-600 text-white text-xs"
          >
            Add Member
          </button>
        </div>
        {members.map((member, index) => (
          <div
            key={member.key}
            className="border rounded-lg p-3 space-y-2 bg-slate-50"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-600">
                Member {index + 1}
              </p>
              <button
                type="button"
                onClick={() => removeMember(index)}
                className="text-xs px-2 py-1 rounded bg-red-50 text-red-600"
              >
                Remove
              </button>
            </div>
            <input
              value={member.name}
              onChange={(e) => updateMember(index, "name", e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm"
              placeholder="Name"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                value={member.role}
                onChange={(e) => updateMember(index, "role", e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="Role"
              />
              <input
                value={member.department}
                onChange={(e) =>
                  updateMember(index, "department", e.target.value)
                }
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="Department"
              />
            </div>
            <input
              value={member.image}
              onChange={(e) => updateMember(index, "image", e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm"
              placeholder="Image URL"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                value={member.email}
                onChange={(e) => updateMember(index, "email", e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="Email"
              />
              <input
                value={member.phone}
                onChange={(e) => updateMember(index, "phone", e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="Phone"
              />
            </div>
            <textarea
              value={member.bio}
              onChange={(e) => updateMember(index, "bio", e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm"
              rows={2}
              placeholder="Bio"
            />
            <input
              value={member.profileUrl}
              onChange={(e) =>
                updateMember(index, "profileUrl", e.target.value)
              }
              className="w-full px-3 py-2 border rounded text-sm"
              placeholder="Profile URL"
            />
          </div>
        ))}
        <details>
          <summary className="text-xs text-slate-600 cursor-pointer">
            Advanced Raw Data Editor
          </summary>
          <textarea
            value={props.membersData || ""}
            onChange={(e) =>
              setProp((p: FacultyGridProps) => (p.membersData = e.target.value))
            }
            rows={7}
            className="w-full mt-2 px-3 py-2 border rounded text-sm"
          />
        </details>
      </div>
    </div>
  );
};

FacultyGrid.craft = {
  displayName: "Faculty Grid",
  props: {
    title: "Our Expert Faculty",
    subtitle: "Faculty",
    columns: 3,
    cardStyle: "classic",
    showContact: true,
    clickAction: "disabled",
    membersData:
      "Dr. Sarah Johnson|Head of Department|Computer Science|https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300&h=300|sarah@college.edu|+91 98765 10001|Ph.D. in Computer Science with 15 years of experience.|/faculty/sarah-johnson\nProf. Michael Chen|Associate Professor|Artificial Intelligence|https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300&h=300|michael@college.edu|+91 98765 10002|Expert in AI and Machine Learning.|/faculty/michael-chen\nDr. Emily Brown|Assistant Professor|Data Science|https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=300&h=300|emily@college.edu|+91 98765 10003|Focuses on Data Structures and Algorithms.|/faculty/emily-brown",
  },
  related: {
    toolbar: FacultyGridSettings,
  },
};
