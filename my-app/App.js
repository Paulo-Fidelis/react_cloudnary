import React, { useState } from "react";
import {
  View,
  Button,
  Image,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import SHA1 from "crypto-js/sha1";

export default function App() {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState(null); 

  const CLOUD_NAME = "ddpazv4iv";
  const UPLOAD_PRESET = "storage";
  const API_KEY = "385433234578277";
  const API_SECRET = "SeNDU_XefgpMS1r8sL6N_E5oBew"; 

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImageUri(result.assets[0].uri); 
    }
  };

  const uploadSelectedImage = async () => {
    if (!selectedImageUri) {
      alert("Nenhuma imagem selecionada para upload.");
      return;
    }

    try {
      setUploading(true);
      const response = await fetch(selectedImageUri);
      const blob = await response.blob();
      const data = new FormData();
      const publicId = `ifpe_${Date.now()}`;

      data.append("public_id", publicId);
      data.append("file", blob);
      data.append("upload_preset", UPLOAD_PRESET);
      data.append("folder", "ifpe");
      data.append("tags", "ifpeaula");

      const upload = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: data,
        }
      );

      const result = await upload.json();

      if (result.secure_url) {
        const newImage = {
          url: result.secure_url,
          public_id: result.public_id,
        };
        setImages([...images, newImage]);
        setSelectedImageUri(null);
        alert("Imagem enviada com sucesso! ✅");
      } else {
        alert("Erro ao fazer upload");
      }
    } catch (error) {
      alert("Erro no upload!");
      console.log(error);
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (publicId) => {
    
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const signature = SHA1(
        `public_id=${publicId}&timestamp=${timestamp}${API_SECRET}`
      ).toString();

      const formData = new FormData();
      formData.append("public_id", publicId);
      formData.append("signature", signature);
      formData.append("api_key", API_KEY);
      formData.append("timestamp", timestamp);

      const del = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await del.json();
      console.log("Delete result:", result);

      if (result.result === "ok") {
        setImages((prev) => prev.filter((img) => img.public_id !== publicId));
        alert("Imagem excluída com sucesso! ✅");
      } else {
        alert("⚠️ Erro ao excluir no Cloudinary! Verifique o console.");
      }
    } catch (error) {
      console.log("Erro ao excluir", error);
      alert("Não foi possível excluir ❌");
    }
  };

  return (
    <View style={styles.container}>

      <Button
        title="Escolher Imagem"
        onPress={pickImage}
        disabled={uploading}
        color="#28a745" 
      />


      {selectedImageUri && (
        <View style={styles.previewContainer}>
          <Image source={{ uri: selectedImageUri }} style={styles.previewImage} />

          <Button
            title={uploading ? "Enviando..." : "Enviar"}
            onPress={uploadSelectedImage}
            disabled={uploading}
            color="#007bff" 
          />
        </View>
      )}

      {uploading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.loadingText}>Upload em andamento...</Text>
        </View>
      )}


      {images.length > 0 && <Text style={styles.listTitle}>Imagens Enviadas:</Text>}

      <FlatList
        data={images}
        keyExtractor={(item) => item.public_id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Image source={{ uri: item.url }} style={styles.image} />
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => deleteImage(item.public_id)}
            >
              <Text style={styles.deleteText}>Excluir</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    paddingTop: 50, 
  },
  previewContainer: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
  },
  previewImage: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 15,
    borderRadius: 4,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 10,
    color: '#333',
  },
  listContent: {
    paddingVertical: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 4,
    marginRight: 10,
  },
  deleteBtn: {
    backgroundColor: 'red',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  deleteText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});