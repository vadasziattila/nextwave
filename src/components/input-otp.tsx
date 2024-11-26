"use client";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import React, { useState } from "react";

export function InputOTPForm({ onSubmit }: { onSubmit: (otp: string) => void }) {
  const [otp, setOtp] = useState("");

  const handleChange = (newOtp: string) => {
    setOtp(newOtp);

    // Automatically trigger onComplete when OTP length is complete
    if (newOtp.length === 6) {
      onSubmit(newOtp);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <InputOTP maxLength={6} value={otp} onChange={handleChange}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
    </div>
  );
}
