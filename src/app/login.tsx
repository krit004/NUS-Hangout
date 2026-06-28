import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView, Platform,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    View
} from "react-native";
import { createAccount, login } from "../firebase/auth";

export default function LoginScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    if (mode === "register") {
      if (!email.endsWith("@u.nus.edu") && !email.endsWith("@nus.edu.sg")) {
        Alert.alert("Error", "Please use your NUS email (@u.nus.edu or @nus.edu.sg).");
        return;
      }
      if (password.length < 6) {
        Alert.alert("Error", "Password must be at least 6 characters.");
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
        router.replace("/");
      } else {
        await createAccount(email, password);
        Alert.alert("Success", "Account created! Please log in.");
        setMode("login");
        setEmail("");
        setPassword("");
      }
    } catch (err: any) {
      Alert.alert("Error", mode === "login"
        ? "Invalid email or password."
        : "Could not create account. Email may already be in use."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.inner}>
        <Text style={styles.logo}>🗺️ NUS Hangout</Text>
        <Text style={styles.title}>
          {mode === "login" ? "Welcome back 👋" : "Join NUS Hangout 🎉"}
        </Text>
        <Text style={styles.sub}>
          {mode === "login" ? "Log in with your NUS account" : "Use your NUS email to sign up"}
        </Text>

        <Text style={styles.label}>NUS Email</Text>
        <TextInput
          style={styles.input}
          placeholder="e0123456@u.nus.edu"
          placeholderTextColor="#9CA3AF"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor="#9CA3AF"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.btnText}>
            {loading ? "Please wait..." : mode === "login" ? "Log in →" : "Create account →"}
          </Text>
        </TouchableOpacity>

        <View style={styles.toggleRow}>
          <Text style={styles.toggleText}>
            {mode === "login" ? "New here? " : "Already have an account? "}
          </Text>
          <TouchableOpacity onPress={() => { setMode(mode === "login" ? "register" : "login"); setEmail(""); setPassword(""); }}>
            <Text style={styles.toggleLink}>
              {mode === "login" ? "Create account" : "Log in"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#4F35D2" },
  inner: { flex: 1, justifyContent: "center", padding: 28, backgroundColor: "#fff", margin: 24, borderRadius: 20, elevation: 10 },
  logo: { fontSize: 20, fontWeight: "800", color: "#4F35D2", marginBottom: 6 },
  title: { fontSize: 22, fontWeight: "700", color: "#111", marginBottom: 4 },
  sub: { fontSize: 14, color: "#9CA3AF", marginBottom: 24 },
  label: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 5 },
  input: { borderWidth: 1.5, borderColor: "#E5E7EB", borderRadius: 10, padding: 12, fontSize: 14, color: "#111", backgroundColor: "#FAFAFA", marginBottom: 14 },
  btn: { backgroundColor: "#4F35D2", borderRadius: 10, padding: 14, alignItems: "center", marginTop: 4 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  toggleRow: { flexDirection: "row", justifyContent: "center", marginTop: 16 },
  toggleText: { fontSize: 13, color: "#9CA3AF" },
  toggleLink: { fontSize: 13, color: "#4F35D2", fontWeight: "600" },
});