import React from "react";
import { render, screen } from "@testing-library/react";
import MatchingRides from "../components/MatchingRides";

describe("MatchingRides Component", () => {
  const mockProps = {
    rides: [
      {
        id: 1,
        rider: {
          fName: "John",
          lName: "Doe",
          contact: "1234567890",
          photoURL: "https://example.com/photo.jpg",
        },
        route: {
          start: { address: "Start Location" },
          end: { address: "End Location" },
        },
        startDate: "2024-03-20T10:00:00",
        type: "offer",
        car: {
          model: "Toyota",
          number: "ABC123",
          seats: 4,
          amount: 100,
        },
      },
    ],
    setSelectedRides: jest.fn(),
    selectedRides: [],
    showNoRidesFound: false,
    searchType: "offer",
    handleRequestANewRide: jest.fn(),
    handleShowModalForNewRide: jest.fn(),
  };

  test("renders ride information correctly", () => {
    render(<MatchingRides {...mockProps} />);

    // Check if rider name is displayed
    //expect(screen.getByText("John")).toBeInTheDocument();

    // Check if route information is displayed
    expect(screen.getByText(/From:/)).toBeInTheDocument();
    expect(screen.getByText(/To:/)).toBeInTheDocument();

    // Check if car information is displayed
    expect(screen.getByText(/Car:/)).toBeInTheDocument();
    expect(screen.getByText(/Seats:/)).toBeInTheDocument();
    expect(screen.getByText(/Tarrif:/)).toBeInTheDocument();
  });
});
