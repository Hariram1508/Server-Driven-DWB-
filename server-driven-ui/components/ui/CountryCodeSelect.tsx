"use client";

import React from "react";
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { ChevronUpDownIcon, CheckIcon } from "@heroicons/react/24/solid";
import { getCountries, getCountryCallingCode } from "libphonenumber-js";

type CountryOption = {
  iso2: string;
  name: string;
  callingCode: string;
  label: string;
};

interface CountryCodeSelectProps {
  value: string;
  onChange: (code: string) => void;
  title?: string;
  className?: string;
}

const buildCountryOptions = (): CountryOption[] => {
  const regionNames =
    typeof Intl !== "undefined" && (Intl as any).DisplayNames
      ? new Intl.DisplayNames(["en"], { type: "region" })
      : null;

  return getCountries()
    .map((iso2) => {
      const countryName = regionNames?.of(iso2) || iso2;
      const callingCode = `+${getCountryCallingCode(iso2)}`;
      return {
        iso2,
        name: countryName,
        callingCode,
        label: `${countryName} (${callingCode})`,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
};

const COUNTRY_OPTIONS = buildCountryOptions();

export default function CountryCodeSelect({
  value,
  onChange,
  title = "Country code",
  className = "",
}: CountryCodeSelectProps) {
  const [query, setQuery] = React.useState("");

  const selected = React.useMemo(
    () =>
      COUNTRY_OPTIONS.find((option) => option.callingCode === value) || null,
    [value],
  );

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return COUNTRY_OPTIONS;
    }

    return COUNTRY_OPTIONS.filter(
      (option) =>
        option.name.toLowerCase().includes(q) ||
        option.callingCode.includes(q) ||
        option.iso2.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <Combobox
      value={selected}
      onChange={(option: CountryOption | null) =>
        onChange(option?.callingCode || "")
      }
      immediate
    >
      <div className={`relative ${className}`}>
        <div className="relative rounded-xl border border-gray-200 bg-white shadow-sm">
          <ComboboxInput
            title={title}
            aria-label={title}
            className="w-full rounded-xl bg-transparent px-3 py-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-200"
            displayValue={(option: CountryOption | null) =>
              option?.callingCode || ""
            }
            placeholder="Code"
            onChange={(event) => setQuery(event.target.value)}
          />
          <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400">
            <ChevronUpDownIcon className="h-5 w-5" aria-hidden="true" />
          </ComboboxButton>
        </div>

        <ComboboxOptions className="absolute left-0 top-full z-50 mt-2 max-h-64 w-[min(340px,calc(100vw-24px))] overflow-auto rounded-xl border border-gray-200 bg-white p-1 shadow-lg">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              No country found
            </div>
          ) : (
            filtered.map((option) => (
              <ComboboxOption
                key={option.iso2}
                value={option}
                className="group flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm text-gray-700 data-[focus]:bg-blue-50"
              >
                <span className="truncate">{option.label}</span>
                <CheckIcon className="h-4 w-4 text-blue-600 opacity-0 group-data-[selected]:opacity-100" />
              </ComboboxOption>
            ))
          )}
        </ComboboxOptions>
      </div>
    </Combobox>
  );
}
