import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRef } from "react";
import { useRecoilValue } from "recoil";
import { stateActiveRect } from "../store";
import { typeCard } from "../types";

const Card = ({ card }: { card: typeCard }) => {
    const activeRect = useRecoilValue(stateActiveRect);
    const cardElement = useRef<HTMLDivElement | null>(null);

    const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
        id: card.id,
        data: {
            type: "card",
            refOne: cardElement,
            card: card,
        },
    });

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
    };

    if (isDragging) {
        return (
            // <div className="h-full bg-purple-50 p-2 rounded-md border border-purple-300"></div>
            <div
                ref={setNodeRef}
                style={{
                    transform: style.transform,
                    height: `${activeRect.data.rect?.height}px`,
                }}
                className="card rounded bg-[#acacac90]"
            ></div>
        );
    }

    return (
        <div
            ref={(node) => {
                setNodeRef(node);
                cardElement.current = node;
            }}
            style={style}
            {...attributes}
            {...listeners}
            className="card rounded bg-white shadow-sm border"
        >
            <p>{card.title}</p>
        </div>
    );
};

export default Card;
