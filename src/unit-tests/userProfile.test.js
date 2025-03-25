import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import UserProfile from "../components/UserProfile";
import { Modal } from "react-bootstrap";
import "@testing-library/jest-dom"; // For the 'toBeInTheDocument' matcher

// Mock components
jest.mock("../components/UserProfileDetails", () => () => (
  <div>Profile Details</div>
));
jest.mock("../components/MyRides", () => () => <div>My Rides</div>);

describe("UserProfile Component", () => {
  const mockUser = {
    displayName: "John Doe",
    photoURL: "https://via.placeholder.com/150",
  };

  const mockLogout = jest.fn();
  const mockShowOfferRideForm = jest.fn();

  beforeEach(() => {
    render(
      <UserProfile
        user={mockUser}
        onLogout={mockLogout}
        showOfferRideForm={mockShowOfferRideForm}
      />,
    );
  });

  test("should render user avatar with initials if no photoURL", () => {
    const { getByText } = render(
      <UserProfile
        user={{ displayName: "John Doe" }}
        onLogout={mockLogout}
        showOfferRideForm={mockShowOfferRideForm}
      />,
    );
    const avatar = getByText("JD");
    expect(avatar).toBeInTheDocument();
  });

  test("should render user avatar with photo if photoURL is present", () => {
    const avatar = screen.getByRole("img");
    expect(avatar).toHaveAttribute("src", "https://via.placeholder.com/150");
  });

  test("should toggle dropdown menu when user clicks avatar", () => {
    const avatar = screen.getByRole("img");
    fireEvent.click(avatar);
    const dropdown = screen.getByText("My Profile");
    expect(dropdown).toBeInTheDocument();
  });

  test("should show modal when 'My Profile' is clicked in dropdown", () => {
    const avatar = screen.getByRole("img");
    fireEvent.click(avatar);

    const myProfileOption = screen.getByText("My Profile");
    fireEvent.click(myProfileOption);

    const modal = screen.getByRole("dialog");
    expect(modal).toBeInTheDocument();
    expect(screen.getByText("My Profile")).toBeInTheDocument(); // Checking the modal title
    expect(screen.getByText("Profile Details")).toBeInTheDocument(); // Checking the modal body content
  });

  test("should show modal when 'My Rides' is clicked in dropdown", () => {
    const avatar = screen.getByRole("img");
    fireEvent.click(avatar);

    const myRidesOption = screen.getByText("My Rides");
    fireEvent.click(myRidesOption);

    const modal = screen.getByRole("dialog");
    expect(modal).toBeInTheDocument();
    const modalTextElement = screen.getAllByText("My Rides");
    expect(modalTextElement.length).toBeGreaterThan(0);
  });

  test("should call onLogout when 'Logout' is clicked in dropdown", () => {
    const avatar = screen.getByRole("img");
    fireEvent.click(avatar);

    const logoutOption = screen.getByText("Logout");
    fireEvent.click(logoutOption);

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
