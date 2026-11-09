import eventModel from "../models/eventModel";
import personModel from "../models/personModel";
import placeModel from "../models/placeModel";
import sourceModel from "../models/sourceModel";
import testimonyModel from "../models/testimonyModel";

// Données d'EXEMPLE pour tester l'affichage. Elles sont fictives :
// à supprimer quand les vraies fiches (sources de l'historien) seront saisies.
export const seedExampleData = async () => {
  try {
    if ((await placeModel.countDocuments()) > 0) return;

    const source = await sourceModel.create({
      type: "autre",
      title: { fr: "Source d'exemple – à remplacer", en: "Example source – to be replaced" },
      holder: "À compléter",
      status: "valide",
    });

    const casemate = await placeModel.create({
      code: "casemate-17",
      kind: "casemate",
      name: { fr: "Casemate 17", en: "Casemate 17" },
      description: {
        fr: "Casemate dont les murs portent des graffitis laissés par des personnes internées. Texte à rédiger à partir des sources.",
        en: "Casemate whose walls bear graffiti left by internees. Text to be written from the sources.",
      },
      position: { x: 640, y: 380 },
      sources: [source._id],
      missingInfo: [
        {
          fr: "Liste des personnes passées par cette casemate",
          en: "List of the people held in this casemate",
        },
      ],
      status: "valide",
    });

    const courtyard = await placeModel.create({
      code: "cour",
      kind: "cour",
      name: { fr: "La cour", en: "The courtyard" },
      description: { fr: "Texte à rédiger.", en: "Text to be written." },
      position: { x: 480, y: 300 },
      status: "valide",
    });

    const event = await eventModel.create({
      title: { fr: "Événement d'exemple – date à vérifier", en: "Example event – date to be checked" },
      description: { fr: "Remplacer par un événement sourcé.", en: "Replace with a sourced event." },
      start: { date: new Date("1942-01-01"), precision: "annee" },
      period: "1940-1944",
      places: [casemate._id],
      sources: [source._id],
      status: "valide",
    });

    const personA = await personModel.create({
      displayName: "Fiche exemple A",
      roles: ["résistante"],
      biography: {
        fr: "Fiche fictive servant uniquement à tester l'affichage.",
        en: "Fictional record used only to test the display.",
      },
      arrivalAtFort: { date: new Date("1942-08-01"), precision: "mois" },
      places: [casemate._id, courtyard._id],
      events: [event._id],
      sources: [source._id],
      claims: [
        {
          field: "arrivee",
          value: { fr: "Arrivée au fort (exemple)", en: "Arrival at the fort (example)" },
          sources: [source._id],
          reliability: "documentee",
          status: "valide",
        },
        {
          field: "depart",
          value: { fr: "Date de départ (exemple)", en: "Departure date (example)" },
          reliability: "incertaine",
          status: "valide",
          note: "Deux sources donnent des dates différentes (exemple).",
        },
      ],
      missingInfo: [{ fr: "Date de départ du fort", en: "Date of departure from the fort" }],
      status: "valide",
    });

    await personModel.create({
      displayName: "Fiche exemple B",
      arrivalAtFort: { date: new Date("1942-08-01"), precision: "mois" },
      publication: {
        consent: "refuse",
        visibility: "reservee",
        note: {
          fr: "La famille a demandé que cette fiche reste limitée au nom.",
          en: "The family asked that this record be limited to the name.",
        },
      },
      status: "valide",
    });

    await personModel.create({
      displayName: "Fiche exemple C",
      arrivalAtFort: { date: new Date("1943-01-01"), precision: "annee" },
      status: "valide",
    });

    await testimonyModel.create({
      witnessName: "Témoin d'exemple",
      witnessRelation: "codétenue",
      livedEvents: true,
      audience: { fr: "Entretien filmé (exemple)", en: "Filmed interview (example)" },
      recordedAt: { date: new Date("1995-01-01"), precision: "annee" },
      collectedBy: "À compléter",
      transformations: "Transcrit",
      medium: "ecrit",
      transcript: { fr: "Texte du témoignage (exemple).", en: "Testimony text (example)." },
      isExcerpt: true,
      notCovered: {
        fr: "Le témoignage ne parle pas de la date de départ.",
        en: "The testimony does not mention the departure date.",
      },
      persons: [personA._id],
      places: [casemate._id],
      sources: [source._id],
      status: "valide",
    });

    console.log("Example data seeded");
  } catch (err) {
    console.error("Cannot seed example data", err);
  }
};
