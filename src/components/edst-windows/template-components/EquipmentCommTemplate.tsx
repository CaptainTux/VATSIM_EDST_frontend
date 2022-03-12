import {EdstTooltip} from "../../resources/EdstTooltip";
import React, {useState} from "react";
import {Tooltips} from "../../../tooltips";
import {EquipmentTemplateRow} from "./EquipmentTemplateMenu";
import {useAppSelector} from "../../../redux/hooks";
import {aselEntrySelector} from "../../../redux/slices/entriesSlice";

enum VoiceCatEnum {
  H = 'H',
  V = 'V',
  U = 'U',
  Y = 'Y'
}

const voiceCatText = {
  H: '(HF)',
  V: '(VHF)',
  U: '(UHF)',
  Y: '(8.33 kHZ)'
}

enum CpdlcCatEnum {
  J1 = 'J1',
  J2 = 'J2',
  J3 = 'J3',
  J4 = 'J4',
  J5 = 'J5',
  J6 = 'J6',
  J7 = 'J7'
}

const cpdlcCatText = {
  J1: '(ATN VDL MODE 2)',
  J2: '(FANS1/A HF)',
  J3: '(FANS1/A VDL MODE A)',
  J4: '(FANS1/A VDL MODE 2)',
  J5: '(FANS1/A INMARSAT)',
  J6: '(FANS1/A MTSAT)',
  J7: '(FANS1/A IRIDIUM)'
}

enum AcarsCatEnum {
  E1 = 'E1',
  E2 = 'E2',
  E3 = 'E3'
}

const acarsCatText = {
  E1: '(FMCWPR)',
  E2: '(D-FIS)',
  E3: '(PDC)'
}

enum SatCatEnum {
  M1 = 'M1',
  M2 = 'M2',
  M3 = 'M3'
}

const satCatText = {
  M1: '(INMARSAT)',
  M2: '(MTSAT)',
  M3: '(IRIDIUM)'
}

export const EquipmentCommTemplate: React.FC = () => {
  const entry = useAppSelector(aselEntrySelector);
  const strings = (entry?.flightplan?.aircraft as string)?.split('/')?.slice(1)?.[0]
    ?.split('-')?.[1]?.match(/[A-Z]\d?/g);
  const voiceCat = strings?.[0]?.split('')?.filter(s => Object.keys(VoiceCatEnum).includes(s)) as VoiceCatEnum[];
  const [voiceCategories, setVoiceCategories] = useState<VoiceCatEnum[]>(voiceCat ?? []);

  const cpdlcCats = strings?.filter(s => Object.keys(CpdlcCatEnum).includes(s)) as CpdlcCatEnum[];
  const [cpdlcCategories, setCpdlcCategories] = useState<CpdlcCatEnum[]>(cpdlcCats ?? []);

  const acarsCats = strings?.filter(s => Object.keys(AcarsCatEnum).includes(s)) as AcarsCatEnum[];
  const [acarsCategories, setAcarsCategories] = useState<AcarsCatEnum[]>(acarsCats ?? []);

  const satCats = strings?.filter(s => Object.keys(SatCatEnum).includes(s)) as SatCatEnum[];
  const [satelliteCategories, setSatelliteCategories] = useState<SatCatEnum[]>(satCats ?? []);

  const toggleCategory = (cat: CpdlcCatEnum | AcarsCatEnum | SatCatEnum | VoiceCatEnum) => {
    if (Object.keys(CpdlcCatEnum).includes(cat)) {
      let cpdlcCats = [...cpdlcCategories];
      let index = cpdlcCats.indexOf(cat as CpdlcCatEnum);
      if (index < 0) {
        setCpdlcCategories([...cpdlcCats, cat as CpdlcCatEnum]);
      }
      else {
        cpdlcCats.splice(index, 1);
        setCpdlcCategories(cpdlcCats);
      }
    }
    else if (Object.keys(AcarsCatEnum).includes(cat)) {
      let acarsCats = [...acarsCategories];
      let index = acarsCats.indexOf(cat as AcarsCatEnum);
      if (index < 0) {
        setAcarsCategories([...acarsCats, cat as AcarsCatEnum]);
      }
      else {
        acarsCats.splice(index, 1);
        setAcarsCategories(acarsCats);
      }
    }
    else if (Object.keys(SatCatEnum).includes(cat)) {
      let satCats = [...satelliteCategories];
      let index = satCats.indexOf(cat as SatCatEnum);
      if (index < 0) {
        setSatelliteCategories([...satCats, cat as SatCatEnum]);
      }
      else {
        satCats.splice(index, 1);
        setSatelliteCategories(satCats);
      }
    }
    else if (Object.keys(VoiceCatEnum).includes(cat)) {
      let voiceCats = [...voiceCategories];
      let index = voiceCats.indexOf(cat as VoiceCatEnum);
      if (index < 0) {
        setVoiceCategories([...voiceCats, cat as VoiceCatEnum]);
      }
      else {
        voiceCats.splice(index, 1);
        setVoiceCategories(voiceCats);
      }
    }
  }

  return (<div>
    <div className="options-row eqp-comm-row margin-top">
      <div className="eqp-col eqp-comm-col">
        <div className="eqp-template-row col-title eqp-col-title">
          VOICE CATEGORY
        </div>
        {Object.keys(VoiceCatEnum).map((category) =>
          <EquipmentTemplateRow
            key={`voice-cat-row-${category}`}
            buttonText={category}
            text={voiceCatText[category as VoiceCatEnum]}
            tooltip={Tooltips[`equipmentTemplateMenuComm_${category as VoiceCatEnum}`]}
            selected={voiceCategories.includes(category as VoiceCatEnum)}
            toggleSelect={() => toggleCategory(category as VoiceCatEnum)}
          />
        )}
      </div>
      <div className="eqp-col eqp-comm-col">
        <div className="eqp-template-row col-title">
          CPDLC CATEGORY
        </div>
        {Object.keys(CpdlcCatEnum).map((category) =>
          <EquipmentTemplateRow
            key={`cpdlc-cat-row-${category}`}
            buttonText={category}
            text={cpdlcCatText[category as CpdlcCatEnum]}
            tooltip={Tooltips[`equipmentTemplateMenuComm_${category as CpdlcCatEnum}`]}
            selected={cpdlcCategories.includes(category as CpdlcCatEnum)}
            toggleSelect={() => toggleCategory(category as CpdlcCatEnum)}
          />
        )}
      </div>
      <div className="eqp-col eqp-comm-col">
        <div className="eqp-template-row col-title eqp-col-title">
          ACARS CATEGORY
        </div>
        {Object.keys(AcarsCatEnum).map((category) =>
          <EquipmentTemplateRow
            key={`acars-cat-row-${category}`}
            buttonText={category}
            text={acarsCatText[category as AcarsCatEnum]}
            tooltip={Tooltips[`equipmentTemplateMenuComm_${category as AcarsCatEnum}`]}
            selected={acarsCategories.includes(category as AcarsCatEnum)}
            toggleSelect={() => toggleCategory(category as AcarsCatEnum)}
          />
        )}
      </div>
      <div className="eqp-col eqp-comm-col">
        <div className="eqp-template-row col-title eqp-col-title">
          SATELLITE RTF
        </div>
        {Object.keys(SatCatEnum).map((category) =>
          <EquipmentTemplateRow
            key={`satellite-cat-row-${category}`}
            buttonText={category}
            text={satCatText[category as SatCatEnum]}
            tooltip={Tooltips[`equipmentTemplateMenuComm_${category as SatCatEnum}`]}
            selected={satelliteCategories.includes(category as SatCatEnum)}
            toggleSelect={() => toggleCategory(category as SatCatEnum)}
          />
        )}
      </div>
    </div>
    <div className="eqp-template-row bottom-row">
      DAT/
      <EdstTooltip className="input-container flex" title={Tooltips.equipmentTemplateMenuComm_Dat}>
        <input/>
      </EdstTooltip>
    </div>
    <div className="eqp-template-row bottom-row">
      COM/
      <EdstTooltip className="input-container flex" title={Tooltips.equipmentTemplateMenuComm_Com}>
        <input/>
      </EdstTooltip>
    </div>
  </div>);
};