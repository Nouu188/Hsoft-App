// components/AuthInput.tsx
import React from "react";
import { TextInput, View, Text, StyleSheet } from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";

type Props = {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  icon?: string; // tên icon Ionicons
};

export const AuthInput: React.FC<Props> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry,
  icon,
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrapper, error && styles.inputError]}>
        {icon && <Ionicons name={icon as any} size={20} color="#888" style={styles.icon} />}
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          autoCapitalize="none"
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { marginBottom: 6, fontSize: 14, fontWeight: "500", color: "#333" },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  inputError: { borderColor: "red" },
  icon: { marginRight: 8 },
  input: { flex: 1, fontSize: 16, color: "#000" },
  errorText: { marginTop: 4, fontSize: 12, color: "red" },
});
