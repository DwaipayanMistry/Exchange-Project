import { Markets } from "@/components/Markets";
export default function Page() {
  return (
    <div className="flex flex-row flex-1">
      <div className="flex flex-col justify-center items-center flex-1 pt-[100px">
        {/* -------Markets page------- */}
        <Markets></Markets>
      </div>
    </div>
  );
}
