import { GenerateGraph } from "./main";
import { Request, GraphToQuery, RenderType } from "./DataProcessing/GraphToQuery"
import { SettingsManager } from "./SettingsManager";

const NewThefts : string[] = [
    "FEYALUZRP9VVDKUNLUBGBDGHRMYUKLSRGX9HNRVKPT99KDELZHWOHJRATORHNKHVBEWZEWBUAOKNVPFPDQUXYPJQGZ",
    //"9BHLFKQGEBEESQBNUOEDOKWJEOFKFTFBFIPLEIYQ9KJCIRUHFHNVTOOYSSZIHQTEXXL9GLFBRADUDWJKX",
    //"GUMDQOFUBXLISNJLWFVKAERLIXIMFGIEY9VZFSOIKBJXFTTJOTSKRAJJJKBNCHFPFKUKISHIVNXGTFFEB",
    //"XGAESRZLTFJN9HXVDASKBVSBNGSZKAUBSSRTBFGIGHUEDCJLY9JVIRLISUXRETKWGUZKCFTEWJFFLBSBB"
];

export const command : Request = {
    name : "NewThefts",
    seperateRender : true,
    outputAllTxs : false,
    outputAllBundles : false,
    outputAllAddresses : false,
    outputAllPositiveAddresses : false,
    graphs : [ 
        new GraphToQuery("NewThefts", RenderType.ADD, "#fcc658", "#ffb621", undefined, undefined, NewThefts ),
        //new GraphToQuery("OKEx", RenderType.SUBTRACT, "#fa7602", "#fc8f30", OKExTxs, undefined, undefined ),
        //new GraphToQuery("OKExExtra", RenderType.SUBTRACT, "#C252F3", "#9D28CF", OKExExtraTransactions, undefined, undefined ),
    ]
};

export const ProviderList = [
    "https://nodes.iota.org:443"
];


SettingsManager.GetInstance().AddNodes(ProviderList)
GenerateGraph(command);