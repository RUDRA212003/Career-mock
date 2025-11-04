import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { InterviewType } from "@/services/Constants";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ArrowRight } from "lucide-react";

function FormContainer({ onHandleInputChange, GoToNext }) {
  const [interviewType, setInterviewType] = useState([]);

  useEffect(() => {
    if (interviewType) {
      onHandleInputChange("type", interviewType);
    }
  }, [interviewType]);

  const AddInterviewType = (name) => {
    const exists = interviewType.includes(name);
    if (!exists) {
      setInterviewType((prev) => [...prev, name]);
    } else {
      setInterviewType(interviewType.filter((item) => item !== name));
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-white rounded-xl shadow-md w-full">
      {/* Job Position */}
      <div>
        <h2 className="text-sm sm:text-base font-medium text-gray-800">
          Job Position
        </h2>
        <Input
          placeholder="e.g. Software Engineer"
          className="mt-2 text-sm sm:text-base"
          onChange={(event) =>
            onHandleInputChange("jobPosition", event.target.value)
          }
        />
      </div>

      {/* Job Description */}
      <div className="mt-4">
        <h2 className="text-sm sm:text-base font-medium text-gray-800">
          Job Description
        </h2>
        <Textarea
          placeholder="Enter detailed job description"
          className="mt-2 h-[150px] sm:h-[180px] md:h-[200px] text-sm sm:text-base"
          onChange={(event) =>
            onHandleInputChange("jobDescription", event.target.value)
          }
        />
      </div>

      {/* Interview Duration */}
      <div className="mt-4">
        <h2 className="text-sm sm:text-base font-medium text-gray-800">
          Interview Duration
        </h2>
        <Select
          onValueChange={(value) => {
            onHandleInputChange("duration", value);
          }}
        >
          <SelectTrigger className="w-full mt-2 text-sm sm:text-base">
            <SelectValue placeholder="Select Duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5 Min">5 Min</SelectItem>
            <SelectItem value="15 Min">15 Min</SelectItem>
            <SelectItem value="30 Min">30 Min</SelectItem>
            <SelectItem value="45 Min">45 Min</SelectItem>
            <SelectItem value="60 Min">60 Min</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Interview Type */}
      <div className="mt-4">
        <h2 className="text-sm sm:text-base font-medium text-gray-800">
          Interview Type
        </h2>
        <div className="flex flex-wrap gap-2 sm:gap-3 mt-2">
          {InterviewType.map((type, index) => (
            <div
              key={index}
              className={`cursor-pointer flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-full text-sm sm:text-base transition-all 
                ${
                  interviewType.includes(type.name)
                    ? "text-primary bg-blue-50 border-blue-300"
                    : "hover:bg-gray-50"
                }`}
              onClick={() => AddInterviewType(type.name)}
            >
              <type.icon className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="truncate">{type.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <div className="mt-7 flex justify-end sm:justify-end">
        <Button
          className="w-full sm:w-auto flex justify-center items-center gap-2 py-3 sm:py-2 text-sm sm:text-base"
          onClick={() => GoToNext()}
        >
          Generate Question <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default FormContainer;
