import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  FlatList,
} from "react-native";
import { COLORS, SIZES } from "@/constants/theme";
import type { AppointmentItem } from "./types";
import { Entity } from "@/components/specific/schedule/appointment/components/doctor_list/EntityCard";
import Ionicons from "@react-native-vector-icons/ionicons";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const COLLAPSED_HEIGHT = 70;
const EXPANDED_HEIGHT = SCREEN_HEIGHT * 0.9;

interface SelectedFooterProps {
  selectedDoctors: Entity[];
  selectedClinics?: Entity[];
  appointments?: AppointmentItem[];
  onNext: () => void;
  onRemove: (entity: Entity, date: string) => void;
}

const SelectedFooter: React.FC<SelectedFooterProps> = ({
  selectedDoctors,
  selectedClinics = [],
  appointments = [],
  onNext,
  onRemove,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const animatedHeight = useRef(new Animated.Value(COLLAPSED_HEIGHT)).current;
  const allEntities = [...selectedDoctors, ...selectedClinics];
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -4,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const animateHeight = (expanded: boolean) => {
    Animated.timing(animatedHeight, {
      toValue: expanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const toggleExpand = () => {
    if (allEntities.length === 0) return;
    setIsExpanded((prev) => {
      const next = !prev;
      animateHeight(next);
      Animated.timing(rotateAnim, {
        toValue: next ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }).start();

      return next;
    });
  };

  useEffect(() => {
    if (allEntities.length === 0) {
      setIsExpanded(false);
      animateHeight(false);
    }
  }, [allEntities.length]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => false,
    })
  ).current;

  const summaryText =
    allEntities.length === 0
      ? ""
      : selectedDoctors.length > 0
        ? `${selectedDoctors.length} bác sĩ đã chọn`
        : `${selectedClinics.length} phòng khám đã chọn`;

  const renderDetailItem = ({ item }: { item: AppointmentItem }) => (
    <View style={styles.detailItem}>
      {/* Hàng đầu tiên: Tên + icon xoá */}
      <View style={styles.titleRow}>
        <Text style={styles.detailTitle}>{item.entity.name}</Text>
        <TouchableOpacity onPress={() => onRemove(item.entity, item.date)}>
          <Ionicons name="trash-outline" size={20} color="black" />
        </TouchableOpacity>
      </View>
      {item.entity.specialty && (
        <Text style={styles.detailSub}>
          Chuyên khoa: {item.entity.specialty}
        </Text>
      )}
      {item.entity.type === "doctor" && (
        <Text style={styles.detailSub}>
          Giới tính: {item.entity.gender === "male" ? "Nam" : "Nữ"}
        </Text>
      )}
      {item.date && <Text style={styles.detailSub}>Ngày: {item.date}</Text>}
      {item.time && <Text style={styles.detailSub}>Giờ: {item.time}</Text>}
    </View>
  );
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <Animated.View
      style={[styles.footer, { height: animatedHeight }]}
    >
      {/* Header */}
      <View style={styles.headerRow} {...panResponder.panHandlers}>
        <View style={styles.leftBox}>
          <Text style={styles.summaryText}>{summaryText}</Text>
          {allEntities.length > 0 && (
            <TouchableOpacity onPress={toggleExpand}>
              <Animated.View
                style={{
                  transform: [{ translateY: floatAnim }, { rotate }],
                }}
              >
                <Ionicons name="chevron-up-outline" size={20} color="black" />
              </Animated.View>
            </TouchableOpacity>
          )}
        </View>

        {/* Nút tiếp tục */}
        {allEntities.length > 0 && (
          <TouchableOpacity
            style={[
              styles.nextButton,
              { opacity: allEntities.length > 0 ? 1 : 0.6 },
            ]}
            disabled={allEntities.length === 0}
            onPress={onNext}
          >
            <Text style={styles.nextButtonText}>Tiếp tục</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Nội dung khi expand */}
      {isExpanded && (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.key}
          renderItem={renderDetailItem}
          contentContainerStyle={[
            styles.detailList,
            { paddingBottom: SIZES.padding * 11 },
          ]}
          showsVerticalScrollIndicator
        />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  footer: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: SIZES.padding,
    flexDirection: "column",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: SIZES.base,
  },
  leftBox: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  summaryText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "600",
    marginRight: 8,
  },
  nextButton: {
    backgroundColor: COLORS.lightBlue,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  detailList: {
    paddingBottom: 90,
  },
  detailItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  detailSub: {
    fontSize: 14,
    color: COLORS.placeHolderIcon,
  },
  nextButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "600",
  },
});

export default SelectedFooter;
