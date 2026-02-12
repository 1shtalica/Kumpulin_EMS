import { ArrowUpIcon } from "lucide-react";
import { Button } from "../ui/button";

const onClick = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

export default function GoToUpButton() {
  return (
    <div className="fixed bottom-4 right-4">
      <Button variant="brand" size="icon" onClick={onClick} className="rounded-full text-white">
        <ArrowUpIcon className="h-4 w-4" />
      </Button>
    </div>
  );
}
