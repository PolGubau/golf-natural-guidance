import type { Metadata } from "next";
import { BookingExperience } from "~/features/client-booking/booking-experience";

export const metadata: Metadata = { title: "Reserva tu clase" };

export default function BookingPage() {
  return <BookingExperience />;
}
