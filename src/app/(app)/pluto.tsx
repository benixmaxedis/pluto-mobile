import { useState, useRef, useCallback } from 'react';
import { View, Text, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, fontSize, borderRadius } from '@/lib/theme';
import { TextInput, Button } from '@/components/ui';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome',
    role: 'assistant',
    content: "I'm Pluto. How can I help?",
  },
];

export default function PlutoScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const handleSend = useCallback(() => {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
    };

    const assistantMessage: ChatMessage = {
      id: `asst-${Date.now()}`,
      role: 'assistant',
      content:
        "Thanks for sharing that. I'm still learning, but I'm here to help you think things through. Full AI responses are coming soon!",
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInputText('');
  }, [inputText]);

  const renderMessage = useCallback(({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';

    return (
      <View
        style={{
          alignSelf: isUser ? 'flex-end' : 'flex-start',
          maxWidth: '80%',
          marginVertical: spacing.xs,
        }}
      >
        <View
          style={{
            backgroundColor: isUser ? colors.actions.primary : colors.surface,
            borderRadius: borderRadius.lg,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            borderWidth: isUser ? 0 : 1,
            borderColor: colors.border,
          }}
        >
          <Text
            style={{
              fontSize: fontSize.base,
              color: isUser ? colors.background : colors.text.primary,
              lineHeight: 22,
            }}
          >
            {item.content}
          </Text>
        </View>
      </View>
    );
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <View style={{ padding: spacing.lg, paddingBottom: spacing.sm }}>
          <Text
            style={{
              fontSize: fontSize.xl,
              fontWeight: '700',
              color: colors.text.primary,
            }}
          >
            Pluto
          </Text>
          <Text
            style={{
              fontSize: fontSize.sm,
              color: colors.text.secondary,
              marginTop: spacing.xs,
            }}
          >
            Your AI guide. Ask anything.
          </Text>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing.md,
            flexGrow: 1,
            justifyContent: 'flex-end',
          }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />

        {/* Input bar */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            backgroundColor: colors.background,
          }}
        >
          <View style={{ flex: 1 }}>
            <TextInput
              placeholder="Message Pluto..."
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />
          </View>
          <Button
            title="Send"
            variant="primary"
            size="md"
            accentColor={colors.actions.primary}
            onPress={handleSend}
            disabled={!inputText.trim()}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
