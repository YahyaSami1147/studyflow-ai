import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AuthPage } from "@/components/auth-page";

describe("AuthPage", () => {
  it("renders the login controls a user can access", () => {
    render(<AuthPage mode="login" />);

    expect(screen.getByRole("heading", { name: "Welcome back" })).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email");
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
    expect(screen.getByRole("button", { name: "Log in" })).toBeInTheDocument();
  });
});
