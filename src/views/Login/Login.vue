<template>
  <div></div>
</template>

<script>
import storage from "good-storage";
import { login } from "@/service";
export default {
  data() {
    return {
      inBrowser: false,
      authCode: "",
    };
  },
  mounted() {
    this.inBrowser = location.search.slice(1).split("&")[0].split("=")[1];
    this.authCode = location.search.slice(1).split("&")[1].split("=")[1];
    this.getLogin();
  },
  methods: {
    async getLogin() {
      const res = await login({ authCode: this.authCode });
      storage.set("Auth", res.tokenHead + res.token);
      this.$store.state.Auth = res.tokenHead + res.token;

      if (this.inBrowser === "true") {
        this.$router.push({
          name: "sort-sub",
          query: {
            secondId: storage.get("secondId"),
            thirdId: storage.get("thirdId"),
          },
        });
      } else {
        this.$router.push("/home");
      }
    },
  },
};
</script>
