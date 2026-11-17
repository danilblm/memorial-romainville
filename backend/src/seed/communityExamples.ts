import bcrypt from "bcrypt";
import crypto from "crypto";
import commentModel from "../models/commentModel";
import contributionModel from "../models/contributionModel";
import memberModel from "../models/memberModel";
import postModel from "../models/postModel";

// Données d'EXEMPLE pour montrer la communauté et les archives publiées.
// Membres et textes sont fictifs (tag « exemple ») : à supprimer avant la mise en ligne.
// Les comptes d'exemple reçoivent un mot de passe aléatoire : personne ne peut s'y connecter.
export const seedCommunityExamples = async () => {
  try {
    if ((await memberModel.countDocuments()) === 0) await seedCommunity();
    if ((await contributionModel.countDocuments({ status: "valide" })) === 0) await seedArchives();
  } catch (err) {
    console.error("Cannot seed community examples", err);
  }
};

const randomPassword = () => bcrypt.hash(crypto.randomBytes(24).toString("hex"), 10);
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

const seedCommunity = async () => {
  const [claire, malik, sophie] = await memberModel.create([
    {
      displayName: "Claire (exemple)",
      email: "claire@exemple.invalid",
      password: await randomPassword(),
      profile: "descendant",
      bio: "Profil d'exemple : petite-fille d'une femme internée au fort, je cherche à reconstituer son parcours.",
      interests: ["généalogie", "lettres", "casemates"],
    },
    {
      displayName: "Malik (exemple)",
      email: "malik@exemple.invalid",
      password: await randomPassword(),
      profile: "enseignant",
      bio: "Profil d'exemple : professeur d'histoire, je prépare un projet avec mes élèves de 3e.",
      interests: ["pédagogie", "seconde guerre mondiale"],
    },
    {
      displayName: "Sophie (exemple)",
      email: "sophie@exemple.invalid",
      password: await randomPassword(),
      profile: "chercheur",
      bio: "Profil d'exemple : doctorante, je travaille sur les graffitis des lieux d'internement.",
      interests: ["graffitis", "archives", "histoire orale"],
    },
  ]);

  const posts = await postModel.create([
    {
      author: claire._id,
      kind: "question",
      title: "Comment retrouver la trace d'une internée ?",
      text: "Ma grand-mère parlait du « fort » sans jamais donner de détails. Par où commencer pour savoir si elle est passée par Romainville ? Quelles archives consulter en premier ?",
      tags: ["généalogie", "archives", "exemple"],
      likes: [malik._id, sophie._id],
      createdAt: daysAgo(6),
    },
    {
      author: sophie._id,
      kind: "archive",
      title: "Les graffitis de la casemate 17",
      text: "Photo prise lors d'une visite. Certains noms sont encore lisibles. Si vous reconnaissez un nom, n'hésitez pas à le proposer au mémorial via l'espace « Contribuer » pour qu'il soit vérifié.",
      image: { url: "/images/histoire/graffiti-crepy.jpg", alt: "Graffitis gravés sur un mur de casemate" },
      tags: ["graffitis", "casemates", "exemple"],
      likes: [claire._id],
      createdAt: daysAgo(3),
    },
    {
      author: malik._id,
      kind: "recherche",
      title: "Projet pédagogique : qui veut témoigner ?",
      text: "Avec ma classe, nous préparons une exposition sur les femmes résistantes. Des familles accepteraient-elles d'échanger avec les élèves (en visio ou par écrit) ?",
      tags: ["pédagogie", "témoignages", "exemple"],
      likes: [claire._id, sophie._id],
      createdAt: daysAgo(1),
    },
  ]);

  const comments = [
    {
      post: posts[0]._id,
      author: sophie._id,
      text: "Commencez par les archives départementales et le Service historique de la Défense à Caen. Les registres d'entrée sont souvent la première piste.",
      createdAt: daysAgo(5),
    },
    {
      post: posts[0]._id,
      author: malik._id,
      text: "Pensez aussi aux lettres et photos de famille : elles peuvent donner des dates précises.",
      createdAt: daysAgo(4),
    },
    {
      post: posts[2]._id,
      author: claire._id,
      text: "Avec plaisir, je peux raconter ce que ma famille sait. Contactez-moi ici.",
      createdAt: daysAgo(1),
    },
  ];
  await commentModel.create(comments);
  for (const post of posts) {
    await postModel.updateOne(
      { _id: post._id },
      { commentCount: comments.filter((c) => String(c.post) === String(post._id)).length }
    );
  }

  console.log("Community examples seeded");
};

const seedArchives = async () => {
  await contributionModel.create([
    {
      contributor: { name: "Exemple Famille", email: "famille@exemple.invalid", relation: "Petite-fille (exemple)" },
      target: { kind: "person", label: "Fiche exemple A" },
      content:
        "Contribution d'exemple : lettre écrite depuis le fort et conservée par la famille. Elle évoque le quotidien dans la casemate et l'attente des colis.",
      declaredProvenance: "Archives familiales (exemple)",
      consentToPublish: true,
      status: "valide",
      decision: { at: daysAgo(10), reason: "Exemple validé pour la démonstration" },
    },
    {
      contributor: { name: "Exemple Visiteur", email: "visiteur@exemple.invalid", relation: "Habitant des Lilas (exemple)" },
      target: { kind: "place", label: "Casemate 17" },
      content:
        "Contribution d'exemple : carte postale ancienne montrant l'entrée du fort, achetée dans une brocante des Lilas.",
      declaredProvenance: "Collection personnelle (exemple)",
      consentToPublish: true,
      status: "valide",
      decision: { at: daysAgo(4), reason: "Exemple validé pour la démonstration" },
    },
  ]);
  console.log("Archive examples seeded");
};
