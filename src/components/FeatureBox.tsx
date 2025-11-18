import React, { useRef, useState, useEffect } from "react";

const steps = [
  {
    title: "1. Select the cancer type",
    desc: "This step involves selecting the specific cancer type that the user wants to detect.",
  },
  {
    title: "2. Select the dataset type",
    desc: "This step involves adjusting to the type of dataset the user has.",
  },
  {
    title: "3. Datasets upload",
    desc: "This step involves the user uploading datasets for AI processing.",
  },
  {
    title: "4. Diagnosis Result",
    desc: "This step involves obtaining diagnostic results for further medical action.",
  },
];

const DiagnosisSteps = () => {
  return (
    <section className="w-full py-12 bg-white flex justify-center">
      <div className="relative w-full max-w-6xl px-6">
        {/* Horizontal line (timeline) – hidden on mobile */}
        <div className="hidden md:block absolute top-8 left-0 right-0 h-1 bg-blue-300" />

        {/* Steps */}
        <div className="flex flex-wrap md:flex-nowrap justify-center md:justify-between gap-6 relative z-10">
          {steps.map((step, index) => (
            <StepBox key={index} title={step.title} desc={step.desc} />
          ))}
        </div>
      </div>
    </section>
  );
};

const StepBox = ({ title, desc }: { title: string; desc: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState("0px");

  useEffect(() => {
    if (contentRef.current) {
      const scrollHeight = contentRef.current.scrollHeight;
      setHeight(isOpen ? `${scrollHeight}px` : "0px");
    }
  }, [isOpen]);

  return (
    <div className="flex flex-col items-center w-full sm:w-[220px]">
      {/* Circle above (only visible on desktop) */}
      <div
        className="hidden md:block w-6 h-6 rounded-full bg-blue-900 border-4 border-white shadow cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      ></div>

      {/* Box */}
      <div
        className="mt-4 bg-blue-900 text-white rounded-lg shadow-md cursor-pointer w-full transition-all duration-300 ease-in-out"
      >
        {/* Title */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="p-4 text-center font-semibold text-base select-none"
        >
          {title}
        </div>

        {/* Description */}
        <div
          ref={contentRef}
          style={{
            height,
            transition: "height 300ms ease-in-out",
            overflow: "hidden",
          }}
          className="px-4 text-sm text-blue-100 text-center"
        >
          <div className="py-2">{desc}</div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosisSteps;
