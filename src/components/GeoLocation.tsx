"use client";
import { useState, useEffect } from "react";

export default function GeoLocation() {
  const [location, setLocation] = useState<{ latitude: number | null; longitude: number | null }>({
    latitude: null,
    longitude: null,
  });
  const [country, setCountry] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState<boolean>(false);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocalização não é suportada no seu navegador.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        setError(null);
        setPermissionDenied(false); // Reseta o estado de permissão negada
        fetchCountryName(latitude, longitude); // Obtém o nome do país
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setPermissionDenied(true); // Usuário negou a permissão
        }
        setError(`Erro ao obter localização: ${err.message}`);
      }
    );
  };

  const fetchCountryName = async (latitude: number, longitude: number) => {
    try {
      const API_KEY = process.env.NEXT_PUBLIC_API_KEY; // Substitua pela sua chave da OpenCage
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${API_KEY}`
      );
      const data = await response.json();
      const countryName = data.results[0]?.components?.country;
      setCountry(countryName || "País não encontrado");
    } catch (err) {
      console.log(err);
      setError("Erro ao obter o nome do país.");
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  return (
    <div>
      <h1>Exemplo de Geolocalização</h1>
      {error ? (
        <div>
          <p style={{ color: "red" }}>{error}</p>
          {permissionDenied ? (
            <p>
              Parece que você negou a permissão de geolocalização. Verifique as configurações do
              navegador para permitir o acesso à localização e tente novamente.
            </p>
          ) : null}
          <button onClick={getLocation}>Tentar novamente</button>
        </div>
      ) : location.latitude && location.longitude ? (
        <div>
          <p>
            Sua localização atual é: <br />
            Latitude: {location.latitude} <br />
            Longitude: {location.longitude}
          </p>
          {country && <p>País: {country}</p>}
        </div>
      ) : (
        <p>Obtendo sua localização...</p>
      )}
    </div>
  );
}
