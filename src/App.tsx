import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    MouseSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, horizontalListSortingStrategy } from "@dnd-kit/sortable";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useRecoilState, useSetRecoilState } from "recoil";

// recoil states
import Card from "./components/Card";
import List from "./components/List";
import { stateActiveRect, stateCards, stateLists } from "./store";
import { typeCard, typeList } from "./types";

const globalLists: Array<typeList> = [];
const globalCards: Array<typeCard> = [];

const generateLists = (length: number) => {
    for (let i = 0; i < length; i++) {
        const newList: typeList = {
            id: crypto.randomUUID(),
            title: `List ${i + 1}`,
        };
        globalLists.push(newList);
    }
    // console.log("lists generated");
};

const generateCards = (length: number) => {
    for (let i = 0; i < length; i++) {
        const newCard: typeCard = {
            id: crypto.randomUUID(),
            idList: globalLists[Math.floor(Math.random() * globalLists.length)].id,
            title: `card ${i + 1}`,
        };
        globalCards.push(newCard);
    }
    // console.log("cards generated");
};

const getListsIds = (lists: Array<typeList>) => {
    const ids: Array<string> = [];
    lists.forEach((list) => {
        ids.push(list.id);
    });
    return ids;
};

// initialization
generateLists(3);
generateCards(10);

const App = () => {
    const [activeList, setActiveList] = useState<typeList | null>();
    const [activeCard, setActiveCard] = useState<typeCard | null>();

    const setActiveRect = useSetRecoilState(stateActiveRect);
    const [cards, setCards] = useRecoilState(stateCards);
    const [lists, setLists] = useRecoilState(stateLists);

    // memoizes items
    const idLists = useMemo(() => getListsIds(lists.data), [lists]);

    useEffect(() => {
        setLists({
            data: globalLists,
        });

        setCards({
            data: globalCards,
        });
    }, []);

    const onDragStart = (e: DragStartEvent) => {
        console.log(e);

        if (e.active.data.current?.type === "card") {
            const elemCard = e.active.data.current.refOne.current as HTMLElement;
            setActiveCard(e.active.data.current.card);
            console.log(activeCard);
            setActiveRect({
                data: {
                    id: String(e.active.id),
                    rect: {
                        height: elemCard.offsetHeight,
                    },
                },
            });
            // console.log("you are dragging a card");
        }
        if (e.active.data.current?.type === "list") {
            const elemList = e.active.data.current.refOne.current as HTMLElement;
            setActiveList(e.active.data.current.list);
            console.log(activeList);
            setActiveRect({
                data: {
                    id: String(e.active.id),
                    rect: {
                        height: elemList.offsetHeight,
                    },
                },
            });

            // console.log(lists.data);
            // console.log(activeRect.data.rect?.height);
            // console.log("you are dragging a list");
        }
    };

    const onDragOver = (e: DragOverEvent) => {
        // console.log(e);
        const { active, over } = e;

        if (!over) return;

        const idActive = active.id;
        const idOver = over.id;

        if (idActive == idOver) return;

        const isActiveCard = active.data.current?.type == "card";
        const isOverCard = over.data.current?.type == "card";
        const isOverList = over.data.current?.type == "list";

        if (!isActiveCard) return;

        let newCardsArray: Array<typeCard> = [...cards.data];

        if (isActiveCard && isOverCard) {
            console.log("card went over a card");
            const indexActive = cards.data.findIndex((card) => card.id === idActive);
            const indexOver = cards.data.findIndex((card) => card.id === idOver);

            if (cards.data[indexActive].idList != cards.data[indexOver].idList) {
                const updatedActiveCard: typeCard = {
                    ...newCardsArray[indexActive],
                    idList: newCardsArray[indexOver].idList,
                };
                newCardsArray[indexActive] = updatedActiveCard;

                setCards({
                    data: arrayMove(newCardsArray, indexActive, indexOver - 1),
                });
            }

            newCardsArray = arrayMove(newCardsArray, indexActive, indexOver);
            setCards({
                data: newCardsArray,
            });
        }

        if (isActiveCard && isOverList) {
            console.log("card went over a list");
            const indexActive = cards.data.findIndex((card) => card.id === idActive);

            const updatedActiveCard: typeCard = {
                ...newCardsArray[indexActive],
                idList: idOver as string,
            };

            newCardsArray[indexActive] = updatedActiveCard;

            setCards({
                data: arrayMove(newCardsArray, indexActive, indexActive),
            });
        }
    };

    const onDragEnd = (e: DragEndEvent) => {
        // console.log(e);
        setActiveCard(null);
        setActiveList(null);

        const { active, over } = e;

        // if the dragged element did not go over any element
        // then don't do anything
        if (!over) return;

        // check it the active element is a list
        const isActiveList = e.active.data.current?.type === "list";

        // // if the dragged element is not a list
        // // then don't do anything
        if (!isActiveList) return;

        if (isActiveList) {
            const idActive = active.id;
            const idOver = over.id;

            // if the dragged element went over itself
            // then don't do anything
            if (idActive === idOver) return;

            setLists((lists) => {
                const activeIndexList = lists.data.findIndex((list) => list.id === idActive);
                const overIndexList = lists.data.findIndex((list) => list.id === idOver);
                // console.log("list swapped");
                return {
                    data: arrayMove(lists.data, activeIndexList, overIndexList),
                };
            });
        }

        // console.log(activeList);
        if (e.active.data.current?.type === "card") {
            // console.log("you dropped the card");
        }
        if (e.active.data.current?.type === "list") {
            // console.log(lists.data);
            // console.log("you dropped the list");
        }
    };

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 1,
            },
        }),
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 1,
            },
        })
    );

    const filteredCards = (idList: string, cards: Array<typeCard>) => {
        const filteredCardsArray: Array<typeCard> = [];
        cards.filter((card) => {
            if (card.idList == idList) {
                filteredCardsArray.push(card);
            }
        });
        return filteredCardsArray;
    };

    return (
        <div
            className="app-container flex-col space-y-8 overflow-y-hidden"
            style={{ backgroundImage: "url(images/bg-3.jfif)" }}
        >
            <div className="flex flex-col items-center">
                <h1 className="text-4xl font-extrabold text-stone-800 drop-shadow">DND Kit Demo</h1>
                <p>This is a demonstration of a Trello style drag and drop functionality.</p>
            </div>
            <DndContext
                sensors={sensors}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onDragOver={onDragOver}
                // collisionDetection={closestCorners}
            >
                <div className="rounded shadow-lg overflow-hidden">
                    <div className="relative flex items-center justify-center py-1 bg-stone-700  bg-gradient-to-b from-stone-700 via-stone-800 to-stone-900">
                        <div className="absolute top-0 left-0 h-full flex items-center px-4 space-x-1">
                            <div className="bg-rose-500 h-3 w-3 rounded-full"></div>
                            <div className="bg-amber-500 h-3 w-3 rounded-full"></div>
                            <div className="bg-emerald-500 h-3 w-3 rounded-full"></div>
                        </div>
                        <div>
                            <p className="text-sm text-center text-stone-400 font-semibold">Trello Style Drag & Drop</p>
                        </div>
                    </div>
                    <div
                        className="list-container h-[40rem] space-x-4"
                        style={{ backgroundImage: "url(images/app-bg/bg-2.jpg)" }}
                    >
                        <SortableContext items={idLists} strategy={horizontalListSortingStrategy}>
                            {lists.data.map((list) => {
                                return <List key={list.id} list={list} cards={filteredCards(list.id, cards.data)} />;
                            })}
                        </SortableContext>
                    </div>
                </div>
                {createPortal(
                    <DragOverlay>
                        {activeList && (
                            <div className="rotate-[7deg] transition-all ease-in-out">
                                <List list={activeList} cards={filteredCards(activeList.id, cards.data)} />
                            </div>
                        )}
                        {activeCard && (
                            <div className="rotate-[7deg] transition-all ease-in-out">
                                <Card card={activeCard} />
                            </div>
                        )}
                    </DragOverlay>,
                    document.body
                )}
            </DndContext>
            <div className="flex justify-center">
                <div>
                    <p className="text-stone-700 text-sm">Developed with 💖 by <a href="https://www.linkedin.com/in/atharva-malji/" className="font-semibold drop-shadow-sm">Atharva Malji</a></p>
                </div>
            </div>
        </div>
    );
};

export default App;
export type { typeCard, typeList };
