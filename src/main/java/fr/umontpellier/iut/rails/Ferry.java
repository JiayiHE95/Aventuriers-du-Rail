package fr.umontpellier.iut.rails;
import java.util.ArrayList;
import java.util.List;

public class Ferry extends Route {
    /**
     * Nombre de locomotives qu'un joueur doit payer pour capturer le ferry
     */
    private int nbLocomotives;

    public Ferry(Ville ville1, Ville ville2, int longueur, CouleurWagon couleur, int nbLocomotives) {
        super(ville1, ville2, longueur, couleur);
        this.nbLocomotives = nbLocomotives;
    }

    @Override
    public String toString() {
        return String.format("[%s - %s (%d, %s, %d)]", getVille1(), getVille2(), getLongueur(), getCouleur(),
                nbLocomotives);
    }

    public int getNbLocomotives() {
        return nbLocomotives;
    }

    @Override
    public boolean testFaisabiliteGris(List<CouleurWagon> list){
        int nbLoco=0;
        for(CouleurWagon c: list) {
            if(c.equals(CouleurWagon.LOCOMOTIVE)) nbLoco++;
        }
        return super.testFaisabiliteGris(list)&&(nbLoco>=nbLocomotives);
    }

    @Override
    public boolean verifierCouleurWagonChoisie(CouleurWagon wagonChoisi, List<CouleurWagon> cartesWagon,
                                               List<CouleurWagon> cartesWagonPosees){
            int nbLocomotivePose=CouleurWagon.LOCOMOTIVE.compteNbCouleur(cartesWagonPosees);
            boolean bool=true;
            if(!wagonChoisi.equals(CouleurWagon.LOCOMOTIVE)&&
                    nbLocomotivePose+getLongueur()-cartesWagonPosees.size()-1<getNbLocomotives())
                bool=false;
            return bool&&super.verifierCouleurWagonChoisie(wagonChoisi,cartesWagon,cartesWagonPosees);
    }
}
