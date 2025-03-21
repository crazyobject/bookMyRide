import { render, screen } from "@testing-library/react";
import { DateTime } from "../components/DateTime";

test("renders date and time correctly", () => {
  const mockDateTime = { seconds: 1617715200 }; // Corresponds to 2021-04-06T12:00:00.000Z

  render(<DateTime dateTime={mockDateTime} />);

  // Check that the date and time are rendered in the expected format
  const dateTimeElement = screen.getByText(/Apr 06, 2021 01:20 PM/i);
  expect(dateTimeElement).toBeInTheDocument();
});
