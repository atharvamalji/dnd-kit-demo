type typeList = {
    id: string;
    title: string;
};

type typeCard = {
    id: string;
    idList: string;
    title: string;
};

type typeRect = {
    // top: number | null;
    // bottom: number | null;
    // left: number | null;
    // right: number | null;
    // width: number | null;
    height: number | null;
};

type typeActiveRect = {
    id: string;
    rect: typeRect | null;
};

export type { typeList, typeCard, typeRect, typeActiveRect };
