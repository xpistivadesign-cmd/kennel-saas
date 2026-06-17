"use client";

import { useState, useEffect, useTransition } from "react";
import { createLitterAction, addPuppyAction, sellPuppyAction, markLitterAsBornAction, deleteLitterAction } from "./actions";

interface Props {
  litters: any[];
  puppies: any[];
  potentialSires: any[];
  potentialDams: any[];
  activeLitterId: string | null;
}

export default function LittersClient({ litters, puppies, potentialSires, potentialDams, activeLitterId }: Props) {
  const [activeTab, setActiveTab] = useState<string>("directory");
  const [selectedLitterId, setSelectedLitterId] = useState<string | null>(activeLitterId || (litters[0]?.id || null));
  const [sireType, setSireType] = useState("");
  const [damType, setDamType] = useState("");
  const [dbError, setDbError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Kliens oldali lokális kiskutya lista az azonnali reakcióhoz
  const [localPuppies, setLocalPuppies] = useState<any[]>(puppies);

  // Form inputok állapota
  const [formCollar, setFormCollar] = useState("");
  const [formGender, setFormGender] = useState("Male");
  const [formWeightUnit, setFormWeightUnit] = useState("g");
  const [formBirthWeight, setFormBirthWeight] = useState("");
  const [isAddingPuppy, setIsAddingPuppy] = useState(false);

  useEffect(() => {
    setLocalPuppies(puppies);
  }, [puppies]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const err = params.get("error");
      const urlId = params.get("id");
      
      if (err) {
        setDbError(decodeURIComponent(err));
      }
      if (urlId) {
        setSelectedLitterId(urlId);
        setActiveTab("litter-profile");
      }
    }
  }, [litters]);

  const selectedLitter = litters.find((l) => l.id === selectedLitterId);
  const currentPuppies = localPuppies.filter((p) => p.litter_id === selectedLitterId);

  const calculateWhelpingDate = (dateString: string) => {
    if (!dateString) return "Nincs megadva";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Érvénytelen dátum";
    date.setDate(date.getDate() + 63);
    return date.toISOString().split("T")[0];
  };

  const handleMarkAsBorn = async (litterId: string) => {
    const today = new Date().toISOString().split("T")[0];
    const actualDate = prompt("Kérlek, add meg a tényleges ellés dátumát (ÉÉÉÉ-HH-NN):", today);
    
    if (actualDate && actualDate.trim() !== "") {
      startTransition(async () => {
        try {
          await markLitterAsBornAction(litterId, actualDate.trim());
          setDbError(null);
          alert("Alom státusza sikeresen frissítve Ellés-re! 🎉");
        } catch (err: any) {
          setDbError(err.message);
        }
      });
    }
  };

  const handleDeleteLitter = async (litterId: string, letter: string) => {
    if (confirm(`Biztosan törölni szeretnéd a(z) "${letter}" almot és minden adatát a listából?`)) {
      startTransition(async () => {
        try {
          await deleteLitterAction(litterId);
          if (selectedLitterId === litterId) {
            setSelectedLitterId(null);
            setActiveTab("directory");
          }
          setDbError(null);
          alert("Alom sikeresen törölve a rendszerből. 🗑️");
        } catch (err: any) {
          setDbError(err.message);
        }
      });
    }
  };

  const handleCustomAddPuppy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLitterId || !formCollar.trim()) return;

    setIsAddingPuppy(true);
    setDbError(null);

    const formData = new FormData();
    formData.append
