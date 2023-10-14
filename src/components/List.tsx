import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useRef } from "react";
import { useRecoilValue } from "recoil";
import { stateActiveRect } from "../store";
import { typeCard, typeList } from "../types";
import Card from "./Card";

const getCardsIds = (cards: Array<typeCard>) => {
    const ids: Array<string> = [];
    cards.forEach((card) => {
        ids.push(card.id);
    });
    return ids;
};

const List = ({ list, cards }: { list: typeList; cards: Array<typeCard> }) => {
    const activeRect = useRecoilValue(stateActiveRect);

    // memoizes items
    const idCards = useMemo(() => getCardsIds(cards), [cards]);

    const listElement = useRef<HTMLDivElement | null>(null);

    const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
        id: list.id,
        data: {
            type: "list",
            refOne: listElement,
            list: list,
        },
    });

    const style = {
        transition: transition,
        transform: CSS.Transform.toString(transform),
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={{
                    transform: style.transform,
                    height: `${activeRect.data.rect?.height}px`,
                }}
                className="list rounded bg-[#acacac90] h-[10rem]"
            ></div>
        );
    }

    return (
        <div
            style={style}
            ref={(node) => {
                setNodeRef(node);
                listElement.current = node;
            }}
            className="list rounded bg-stone-100 backdrop-blur overflow-hidden border border-[#00000070]"
        >
            <div {...attributes} {...listeners} className="px-2 p-2 border-b hover:bg-[#b4b4b490]">
                <p className="text-sm font-semibold">{list.title}</p>
            </div>
            <div className="space-y-2 p-2">
                <SortableContext items={idCards}>
                    {cards.map((card) => {
                        return <Card key={card.id} card={card} />;
                    })}
                </SortableContext>
            </div>
        </div>
    );
};

export default List;
