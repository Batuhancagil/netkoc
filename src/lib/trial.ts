import { calcNet } from "./utils";

export type TrialRow = {
  turkceD: number;
  turkceY: number;
  sosyalD: number;
  sosyalY: number;
  matD: number;
  matY: number;
  fenD: number;
  fenY: number;
  aytMatD: number;
  aytMatY: number;
  aytFizD: number;
  aytFizY: number;
  aytKimD: number;
  aytKimY: number;
  aytBiyD: number;
  aytBiyY: number;
  aytEdbD: number;
  aytEdbY: number;
  aytTarD: number;
  aytTarY: number;
  aytCogD: number;
  aytCogY: number;
  aytFelD: number;
  aytFelY: number;
};

export function tytNets(t: TrialRow) {
  return {
    turkce: calcNet(t.turkceD, t.turkceY),
    sosyal: calcNet(t.sosyalD, t.sosyalY),
    mat: calcNet(t.matD, t.matY),
    fen: calcNet(t.fenD, t.fenY),
  };
}

export function aytNets(t: TrialRow) {
  return {
    mat: calcNet(t.aytMatD, t.aytMatY),
    fiz: calcNet(t.aytFizD, t.aytFizY),
    kim: calcNet(t.aytKimD, t.aytKimY),
    biy: calcNet(t.aytBiyD, t.aytBiyY),
    edb: calcNet(t.aytEdbD, t.aytEdbY),
    tar: calcNet(t.aytTarD, t.aytTarY),
    cog: calcNet(t.aytCogD, t.aytCogY),
    fel: calcNet(t.aytFelD, t.aytFelY),
  };
}

export function tytTotal(t: TrialRow) {
  const n = tytNets(t);
  return n.turkce + n.sosyal + n.mat + n.fen;
}

export function aytTotal(t: TrialRow) {
  const n = aytNets(t);
  return n.mat + n.fiz + n.kim + n.biy + n.edb + n.tar + n.cog + n.fel;
}
