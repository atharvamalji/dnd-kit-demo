import { atom } from "recoil";
import { typeCard, typeList } from "./App";
import { typeActiveRect } from "./types";

type typeDefaultListState = {
    data: Array<typeList>;
};

type typeDefaultCardState = {
    data: Array<typeCard>;
};

type typeDefaultActiveRectState = {
    data: typeActiveRect;
};

const defaultListState: typeDefaultListState = {
    data: [],
};

const defaultCardState: typeDefaultCardState = {
    data: [],
};

const defaultActiveRectState: typeDefaultActiveRectState = {
    data: {
        id: "",
        rect: null
    }
}

const stateLists = atom({
    key: "lists",
    default: defaultListState,
});

const stateCards = atom({
    key: "cards",
    default: defaultCardState,
});

const stateActiveRect = atom({
    key: "active-rect",
    default: defaultActiveRectState
});

export { stateLists, stateCards, stateActiveRect };
