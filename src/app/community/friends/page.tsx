"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, Loader2, UserPlus, UserMinus, Users, Search } from "lucide-react";
import { followApi } from "@/lib/api-client";
import type { FollowUser } from "@/lib/api-client";

export default function FriendsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("following");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: followers, isLoading: followersLoading } = useQuery({
    queryKey: ["followers"],
    queryFn: () => followApi.getFollowers(),
  });

  const { data: following, isLoading: followingLoading } = useQuery({
    queryKey: ["following"],
    queryFn: () => followApi.getFollowing(),
  });

  const unfollowMutation = useMutation({
    mutationFn: (userId: string) => followApi.unfollow(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["following"] });
      queryClient.invalidateQueries({ queryKey: ["followers"] });
    },
  });

  const isLoading = followersLoading || followingLoading;

  const filteredFollowing = following?.filter((user) =>
    user.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFollowers = followers?.filter((user) =>
    user.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#CDFF00]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="px-4 pt-safe-top pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Friends</h1>
        </div>
      </header>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search friends..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <div className="px-4">
          <TabsList className="w-full bg-muted/50">
            <TabsTrigger value="following" className="flex-1">
              Following ({following?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="followers" className="flex-1">
              Followers ({followers?.length || 0})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Following */}
        <TabsContent value="following" className="mt-4">
          <div className="px-4 space-y-3">
            {filteredFollowing && filteredFollowing.length > 0 ? (
              filteredFollowing.map((user) => (
                <UserCard
                  key={user.userId}
                  user={user}
                  isFollowing={true}
                  onUnfollow={() => unfollowMutation.mutate(user.userId)}
                  isPending={unfollowMutation.isPending}
                />
              ))
            ) : (
              <Card className="p-8 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">Not following anyone</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "No results found" : "Follow friends to see their activity"}
                </p>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Followers */}
        <TabsContent value="followers" className="mt-4">
          <div className="px-4 space-y-3">
            {filteredFollowers && filteredFollowers.length > 0 ? (
              filteredFollowers.map((user) => {
                const isFollowingBack = following?.some((f) => f.userId === user.userId);
                return (
                  <UserCard
                    key={user.userId}
                    user={user}
                    isFollowing={isFollowingBack || false}
                    showFollowBack={!isFollowingBack}
                    onUnfollow={() => {}}
                    isPending={false}
                  />
                );
              })
            ) : (
              <Card className="p-8 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No followers yet</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "No results found" : "Share your profile to get followers"}
                </p>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function UserCard({
  user,
  isFollowing,
  showFollowBack = false,
  onUnfollow,
  isPending,
}: {
  user: FollowUser;
  isFollowing: boolean;
  showFollowBack?: boolean;
  onUnfollow: () => void;
  isPending: boolean;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatarUrl} alt="" className="w-12 h-12 rounded-full" />
          ) : (
            <Users className="w-6 h-6 text-white/60" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">{user.displayName || "Anonymous"}</p>
          {user.bio && (
            <p className="text-sm text-muted-foreground truncate">{user.bio}</p>
          )}
        </div>
        {isFollowing ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onUnfollow}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UserMinus className="w-4 h-4" />
            )}
          </Button>
        ) : showFollowBack ? (
          <Button variant="default" size="sm">
            <UserPlus className="w-4 h-4 mr-1" />
            Follow
          </Button>
        ) : null}
      </div>
    </Card>
  );
}
