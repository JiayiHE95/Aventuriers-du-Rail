package fr.umontpellier.iut.rails;

import java.util.ArrayList;

public class Tunnel extends Route {
    public Tunnel(Ville ville1, Ville ville2, int longueur, CouleurWagon couleur) {
        super(ville1, ville2, longueur, couleur);
    }

    @Override
    public String toString() {
        return "[" + super.toString() + "]";
    }


    @Override
    public boolean seConstruire(CouleurWagon wagonChoisi, Joueur joueur) {
        super.seConstruire(wagonChoisi, joueur);
        CouleurWagon couleurPose = null;
        for (int i = 0; i < joueur.getCartesWagonPosees().size(); i++) {
            if (joueur.getCartesWagonPosees().get(i).equals(CouleurWagon.LOCOMOTIVE)) {
                couleurPose = CouleurWagon.LOCOMOTIVE;
            } else {
                couleurPose = joueur.getCartesWagonPosees().get(i);
                break;
            }
        }
        joueur.log("3 premières cartes de le pile : ");
        ArrayList<CouleurWagon> troisWagons = new ArrayList<>();
        for (int i = 0; i < 3; i++) {
            if (!joueur.getJeu().getPileCartesWagon().isEmpty() || !joueur.getJeu().getDefausseCartesWagon().isEmpty()) {
                troisWagons.add(0, joueur.getJeu().piocherCarteWagon());
                joueur.log(troisWagons.get(0).toLog());
            }
        }
        joueur.getJeu().getDefausseCartesWagon().addAll(troisWagons);
        //on compare ces 3 cartes avec les cartes wagon en mai de joueur
        int nbDefausseTunnel = couleurPose.compteNbCouleur(troisWagons);
        int nbDefaussePossible = couleurPose.compteNbCouleur(joueur.getCartesWagon());
        if(!couleurPose.equals(CouleurWagon.LOCOMOTIVE)) {
            nbDefausseTunnel += CouleurWagon.LOCOMOTIVE.compteNbCouleur(troisWagons);
            nbDefaussePossible += CouleurWagon.LOCOMOTIVE.compteNbCouleur(joueur.getCartesWagon());
        }
        //Si joueur n'a pas pas assez de cartes à défausser, il passe son tour
        if(nbDefaussePossible<nbDefausseTunnel) {
            joueur.getCartesWagon().addAll(joueur.getCartesWagonPosees());
            joueur.getCartesWagonPosees().clear();
            joueur.log("Vous ne pouvez pas construire "+toLog());
            return false;
        }
        if(nbDefausseTunnel==0) return true;

        do {
            String wagonSupADafausser = joueur.choisir("Choisir une carte supplémentaire à défausser"
                    , CouleurWagon.listeWagonToString(joueur.getCartesWagon()), new ArrayList<>(), true);

            if (wagonSupADafausser == "") {
                joueur.getCartesWagon().addAll(joueur.getCartesWagonPosees());
                joueur.getCartesWagonPosees().clear();
                joueur.log("Vous abandonnez la construction de "+toLog());
                return false;
            }

            CouleurWagon wagonSupADafausserCW=CouleurWagon.valueOf(wagonSupADafausser);
            if(wagonSupADafausserCW.equals(couleurPose)||wagonSupADafausserCW.equals(CouleurWagon.LOCOMOTIVE)){
                nbDefausseTunnel--;
                joueur.getCartesWagonPosees().add(wagonSupADafausserCW);
                joueur.getCartesWagon().remove(wagonSupADafausserCW);
                joueur.log("Vous avez posé "+wagonSupADafausserCW.toLog());
            }
        } while (nbDefausseTunnel != 0);
        return true;
    }

}
