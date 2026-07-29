import { type Tag } from "@/interfaces/post";
import { TAG_CLASS } from "@/lib/tags";

export function TagBadge({ tag }: { tag: Tag }) {
  return <span className={`tag ${TAG_CLASS[tag]}`}>{tag}</span>;
}
