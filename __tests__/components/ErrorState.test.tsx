import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { ErrorState } from "@/components/ui/ErrorState";

jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));

describe("ErrorState", () => {
  it("renders default title and message", () => {
    render(<ErrorState />);

    expect(screen.getByText("Something went wrong")).toBeTruthy();
    expect(screen.getByText("Please try again later.")).toBeTruthy();
  });

  it("renders custom title and message", () => {
    render(<ErrorState title="No connection" message="Check your internet" />);

    expect(screen.getByText("No connection")).toBeTruthy();
    expect(screen.getByText("Check your internet")).toBeTruthy();
  });

  it("shows Try Again button when onRetry is provided", () => {
    const onRetry = jest.fn();
    render(<ErrorState onRetry={onRetry} />);

    const button = screen.getByText("Try Again");
    expect(button).toBeTruthy();

    fireEvent.press(button);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("does not show Try Again button when onRetry is not provided", () => {
    render(<ErrorState />);

    expect(screen.queryByText("Try Again")).toBeNull();
  });
});
