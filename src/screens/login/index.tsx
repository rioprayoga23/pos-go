import { HStack, Text, VStack } from "@gluestack-ui/themed";
import { useRef, useState } from "react";
import { Image, ScrollView, View, type TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppIcon, AppInput, AppPressable } from "../../components/ui";
import { colors } from "../../theme";
import { styles } from "./styles";
import { useAuth } from "../../auth/AuthProvider";

export function LoginScreen() {
  const insets = useSafeAreaInsets();
  const passwordInputRef = useRef<TextInput>(null);
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async () => {
    if (submitting) return;
    if (!identity.trim() || !password) {
      setError("Isi username dan kata sandi untuk melanjutkan.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await login(identity.trim(), password);
      setPassword("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Login gagal. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <VStack style={styles.loginPanel}>
          <HStack style={styles.brandRow}>
            <Image
              source={require("../../../assets/stitch/order/logo.png")}
              style={styles.brandLogo}
              resizeMode="cover"
              accessibilityLabel="Logo Kopi & Boba Co."
            />
            <VStack style={styles.brandCopy}>
              <Text style={styles.brandName}>Kopi &amp; Boba Co.</Text>
              <Text style={styles.brandOutlet}>Outlet Kemang</Text>
            </VStack>
          </HStack>

          <View style={styles.rule} />

          <VStack style={styles.intro}>
            <Text style={styles.title}>Masuk</Text>
            <Text style={styles.description}>
              Masuk ke akun kasir untuk melanjutkan.
            </Text>
          </VStack>

          <VStack style={styles.form}>
            <VStack style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Username</Text>
              <AppInput
                value={identity}
                onChangeText={(value) => {
                  setIdentity(value);
                  setError("");
                }}
                placeholder="Masukkan username"
                accessibilityLabel="Username"
                keyboardType="default"
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => passwordInputRef.current?.focus()}
              />
            </VStack>

            <VStack style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Kata sandi</Text>
              <AppInput
                value={password}
                onChangeText={(value) => {
                  setPassword(value);
                  setError("");
                }}
                placeholder="Masukkan kata sandi"
                accessibilityLabel="Kata sandi"
                autoCapitalize="none"
                secureTextEntry={!isPasswordVisible}
                inputRef={passwordInputRef}
                returnKeyType="done"
                onSubmitEditing={() => void handleSubmit()}
                trailing={
                  <AppPressable
                    onPress={() => setIsPasswordVisible((visible) => !visible)}
                    style={styles.passwordToggle}
                    accessibilityRole="button"
                    accessibilityLabel={
                      isPasswordVisible
                        ? "Sembunyikan kata sandi"
                        : "Tampilkan kata sandi"
                    }
                  >
                    <AppIcon
                      name={isPasswordVisible ? "eye-off" : "eye"}
                      size={18}
                      color={colors.inkMuted}
                    />
                  </AppPressable>
                }
              />
            </VStack>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <AppPressable
              onPress={handleSubmit}
              disabled={submitting}
              style={styles.submitButton}
              accessibilityRole="button"
              accessibilityLabel="Masuk ke aplikasi kasir"
            >
              <Text style={styles.submitText}>{submitting ? "Memproses..." : "Masuk"}</Text>
              <AppIcon name="arrow-right" size={18} color={colors.white} />
            </AppPressable>
          </VStack>
        </VStack>
      </ScrollView>
    </View>
  );
}
